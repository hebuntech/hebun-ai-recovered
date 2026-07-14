/*
 * routing-engine.ts — the deterministic Provider Routing Engine. route() takes
 * an execution request and returns a fully explainable RoutingDecision. No real
 * execution, no API calls, no runtime provider invocation — selection only.
 */

import { buildRoutingContext } from "@/features/provider-routing/routing-context";
import { selectProviders } from "@/features/provider-routing/provider-selector";
import { assignTiers } from "@/features/provider-routing/fallback-engine";
import { resolveApproval } from "@/features/provider-routing/approval-filter";
import { assessHealth } from "@/features/provider-routing/health-filter";
import { confidenceBadge } from "@/features/provider-routing/confidence-engine";
import type {
  ProviderCandidate,
  RoutingDecision,
  RoutingExecutionRequest,
} from "@/features/provider-routing/types";

/** fixed epoch so decisions are byte-for-byte deterministic across builds */
const ROUTING_EPOCH = "2025-01-01T00:00:00.000Z";

function explain(
  request: RoutingExecutionRequest,
  primary: ProviderCandidate | undefined,
  approvalRequired: boolean,
  simulationMode: boolean
): string {
  if (!primary) {
    return `No provider satisfies ${request.requiredCapabilities.join(", ")}. Routing escalates to Human Approval / Simulation fallback.`;
  }
  const approvalNote = approvalRequired ? " Human approval is required before execution." : "";
  const simNote = simulationMode ? " Runs in deterministic simulation mode." : "";
  return `${primary.name} selected for ${request.requiredCapabilities.join(", ")} via ${request.strategy} (confidence ${primary.confidence}).${approvalNote}${simNote}`;
}

export function route(request: RoutingExecutionRequest): RoutingDecision {
  const context = buildRoutingContext(request);
  const { candidates: ranked, rejected, stages } = selectProviders(context);
  const candidates = assignTiers(ranked);

  const approval = resolveApproval(request);
  const primary = candidates[0];
  const fallbacks = candidates.slice(1).map((c) => c.providerId);

  const simulationMode = context.simulationOnly || request.executionMode === "Simulation";
  const confidence = primary?.confidence ?? 0;

  const healthAssessment = candidates.map((c) => assessHealth(c.providerId));

  const policyConstraints = primary
    ? context.providers.length > 0
      ? request.policyTags.map((tag) => ({ tag, satisfied: true, note: "Policy recorded (offline)." }))
      : []
    : [];

  return {
    id: `route-${request.id}`,
    requestId: request.requestId,
    strategy: request.strategy,
    primaryProvider: primary?.providerId ?? null,
    fallbackProviders: fallbacks,
    candidateProviders: candidates,
    matchedCapabilities: primary?.matchedCapabilities ?? [],
    confidence,
    selectionReason: primary
      ? `Ranked #1 by ${request.strategy}: capability ${primary.capabilityScore}, health ${primary.healthScore}, policy ${primary.policyScore}.`
      : "No eligible provider after filtering.",
    rejectedProviders: rejected,
    healthAssessment,
    approvalRequirement: approval,
    policyConstraints,
    estimatedLatencyMs: primary?.latencyMs ?? 0,
    estimatedReliability: primary?.reliability ?? 0,
    simulationMode,
    blocked: !primary,
    explanation: explain(request, primary, approval.required, simulationMode),
    stages,
    timestamp: ROUTING_EPOCH,
    confidenceBadge: confidenceBadge(confidence),
  };
}
