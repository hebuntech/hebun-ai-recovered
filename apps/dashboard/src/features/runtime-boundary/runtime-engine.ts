/*
 * runtime-engine.ts — the deterministic Live Provider Runtime Boundary engine.
 * evaluate() takes an invocation and decides whether it may cross into a live
 * runtime. In this phase the answer for live crossing is always "no" — the
 * boundary holds everything on the offline side. No execution, no APIs, no
 * credentials, no network, no LLM.
 */

import { invocations } from "@/features/provider-invocation";
import type { Invocation } from "@/features/provider-invocation";
import { buildRuntimeContext } from "@/features/runtime-boundary/runtime-context";
import { assessCredentials } from "@/features/runtime-boundary/runtime-credentials";
import { assessReadiness } from "@/features/runtime-boundary/runtime-readiness";
import { assessEnvironment } from "@/features/runtime-boundary/runtime-environment";
import { assessRuntimeHealth } from "@/features/runtime-boundary/runtime-health";
import { assessApproval } from "@/features/runtime-boundary/runtime-approval";
import { assessPolicy } from "@/features/runtime-boundary/runtime-policies";
import { assessPromotion } from "@/features/runtime-boundary/runtime-promotion";
import { evaluateGates } from "@/features/runtime-boundary/runtime-gates";
import { buildAudit } from "@/features/runtime-boundary/runtime-audit";
import { buildEvents } from "@/features/runtime-boundary/runtime-events";
import { modeBadge } from "@/features/runtime-boundary/runtime-state";
import type {
  RiskLevel,
  RuntimeDecision,
  RuntimeMode,
  RuntimeState,
} from "@/features/runtime-boundary/types";
import type { BadgeVariant } from "@/components/ui/badge";

const EPOCH = "2025-01-01T00:00:00.000Z";

function riskFor(confidence: number, blocked: boolean): RiskLevel {
  if (blocked) return "high";
  return confidence >= 75 ? "low" : confidence >= 50 ? "medium" : "high";
}

function riskBadgeFor(level: RiskLevel): BadgeVariant {
  return level === "low" ? "success" : level === "medium" ? "warning" : "error";
}

function stateFor(mode: RuntimeMode, blocked: boolean, approvalRequired: boolean, promotable: boolean): RuntimeState {
  if (mode === "Blocked") return "Blocked";
  if (mode === "Emergency Stop") return "Emergency Stopped";
  if (approvalRequired) return "Approval Pending";
  if (blocked) return "Gated";
  if (promotable) return "Promotable";
  return "Ready";
}

export function evaluate(inv: Invocation): RuntimeDecision {
  const context = buildRuntimeContext(inv);

  const credential = assessCredentials(context);
  const environment = assessEnvironment();
  const readiness = assessReadiness(inv, context);
  const health = assessRuntimeHealth(context, readiness);
  const approval = assessApproval(inv, context);
  const policy = assessPolicy(context);
  const promotion = assessPromotion(context, health);

  const gates = evaluateGates({ context, credential, environment, readiness, health, approval, policy, promotion });
  const blockingFailures = gates.filter((g) => g.blocking && !g.passed);
  const blockReasons = blockingFailures.map((g) => `${g.gate}: ${g.reason}`);

  // Crossing into live runtime is never allowed in this phase.
  const allowed = blockingFailures.length === 0 && context.runtimeMode !== "Future Live" && context.runtimeMode !== "Blocked";
  const blocked = !allowed;

  const runtimeState = stateFor(context.runtimeMode, blocked, approval.required, promotion.eligible);
  const risk = riskFor(context.confidence, blocked);

  const audit = buildAudit({ context, allowed, gates, credential, policy, approval, environment, health, promotion });
  const events = buildEvents(context, gates, approval, promotion, allowed);

  const explanation = blocked
    ? `Held on the offline side of the boundary (${context.runtimeMode}). ${blockReasons[0] ?? "Live runtime disabled in this phase."}`
    : `${context.providerId} may run in ${context.runtimeMode} mode. All blocking gates passed; live crossing remains disabled.`;

  return {
    id: `rt-${inv.requestId}`,
    invocationId: inv.id,
    requestId: inv.requestId,
    providerId: context.providerId,
    providerType: context.providerType,
    sourceMode: inv.executionMode,
    runtimeMode: context.runtimeMode,
    runtimeState,
    allowed,
    blocked,
    blockReasons,
    approvalRequired: approval.required,
    credential,
    readiness,
    environment,
    runtimeHealth: health,
    promotion,
    policy,
    approval,
    gates,
    confidence: context.confidence,
    riskLevel: risk,
    simulationFallback: true,
    audit,
    telemetry: {
      gatesEvaluated: gates.length,
      gatesPassed: gates.filter((g) => g.passed).length,
      gatesFailed: gates.filter((g) => !g.passed).length,
      simulation: context.simulation,
      promotionEligible: promotion.eligible,
      blocked,
    },
    events,
    explanation,
    createdAt: EPOCH,
    modeBadge: modeBadge(context.runtimeMode),
    riskBadge: riskBadgeFor(risk),
  };
}

/** deterministic runtime decision set — one per invocation. */
export const runtimeDecisions: RuntimeDecision[] = invocations.map(evaluate);

export function runtimeDecisionByRequestId(requestId: string): RuntimeDecision | undefined {
  return runtimeDecisions.find((d) => d.requestId === requestId);
}
