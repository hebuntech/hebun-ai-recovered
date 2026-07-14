/*
 * invocation-engine.ts — the deterministic Provider Invocation Engine. Runs the
 * invocation pipeline over a routing decision and produces a fully prepared,
 * explainable Invocation. Offline only: valid contracts reach "Ready"; no real
 * provider execution, API call or runtime invocation ever occurs.
 */

import { buildInvocationContext } from "@/features/provider-invocation/invocation-context";
import { buildInvocationRequest } from "@/features/provider-invocation/invocation-request";
import { buildExpectedResponse } from "@/features/provider-invocation/invocation-response";
import { artifactsFor } from "@/features/provider-invocation/invocation-artifacts";
import { retryPolicyFor } from "@/features/provider-invocation/invocation-retry";
import { timeoutPolicyFor } from "@/features/provider-invocation/invocation-timeout";
import { rollbackPolicyFor } from "@/features/provider-invocation/invocation-rollback";
import { cancellationPolicyFor } from "@/features/provider-invocation/invocation-cancellation";
import { buildTelemetry } from "@/features/provider-invocation/invocation-telemetry";
import { buildAudit } from "@/features/provider-invocation/invocation-audit";
import { buildEvents } from "@/features/provider-invocation/invocation-events";
import { lifecycleBadge } from "@/features/provider-invocation/invocation-lifecycle";
import { routingDecisions } from "@/features/provider-routing";
import type { RoutingDecision } from "@/features/provider-routing";
import type { Invocation } from "@/features/provider-invocation/types";

const EPOCH = "2025-01-01T00:00:00.000Z";

export function buildInvocation(decision: RoutingDecision): Invocation {
  const context = buildInvocationContext(decision);
  const mode = context.executionMode;

  const prepared = !decision.blocked && Boolean(decision.primaryProvider);
  const status = prepared ? "Ready" : "Failed";

  const request = buildInvocationRequest(decision, context);
  const expectedResponse = buildExpectedResponse(decision, context);
  const artifacts = prepared ? artifactsFor(decision.matchedCapabilities) : [];

  const retryPolicy = retryPolicyFor(mode);
  const timeoutPolicy = timeoutPolicyFor(mode);
  const rollbackPolicy = rollbackPolicyFor(mode);
  const cancellationPolicy = cancellationPolicyFor(mode);

  const telemetry = buildTelemetry(decision, mode, retryPolicy, timeoutPolicy, rollbackPolicy, prepared);
  const audit = buildAudit(decision, context, retryPolicy, timeoutPolicy, rollbackPolicy, artifacts.length);
  const events = buildEvents(prepared, decision.requestId);

  const explanation = prepared
    ? `${context.providerId} invocation prepared in ${mode} mode. Retry ×${retryPolicy.maxAttempts}, timeout ${timeoutPolicy.timeoutMs}ms, rollback ${rollbackPolicy.enabled ? rollbackPolicy.strategy : "none"}. Live execution deferred.`
    : `Invocation could not be prepared — routing produced no primary provider for ${decision.requestId}.`;

  return {
    id: context.invocationId,
    requestId: decision.requestId,
    routingDecisionId: decision.id,
    providerId: context.providerId,
    providerType: context.providerType,
    executionMode: mode,
    status,
    context,
    request,
    expectedResponse,
    artifacts,
    telemetry,
    events,
    audit,
    retryPolicy,
    timeoutPolicy,
    rollbackPolicy,
    cancellationPolicy,
    confidence: decision.confidence,
    simulation: context.simulation,
    explanation,
    createdAt: EPOCH,
    statusBadge: lifecycleBadge(status),
  };
}

/** deterministic invocation set — one per routing decision. */
export const invocations: Invocation[] = routingDecisions.map(buildInvocation);

export function invocationByRequestId(requestId: string): Invocation | undefined {
  return invocations.find((i) => i.requestId === requestId);
}
