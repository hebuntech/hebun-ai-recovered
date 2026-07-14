/*
 * invocation-audit.ts — deterministic audit records for every invocation
 * dimension. Auditable and offline; references routing + matrix data.
 */

import type { RoutingDecision } from "@/features/provider-routing";
import type {
  InvocationAuditRecord,
  InvocationContext,
  RollbackPolicy,
  TimeoutPolicy,
} from "@/features/provider-invocation/types";
import type { RetryPolicy } from "@/features/adapters";

export function buildAudit(
  decision: RoutingDecision,
  context: InvocationContext,
  retry: RetryPolicy,
  timeout: TimeoutPolicy,
  rollback: RollbackPolicy,
  artifactCount: number
): InvocationAuditRecord[] {
  return [
    { subject: "request", detail: `Request ${context.requestId} for ${decision.matchedCapabilities.join(", ") || "no capability"}.` },
    { subject: "provider", detail: `Provider ${context.providerId ?? "none"} (${context.providerType ?? "n/a"}).` },
    { subject: "routing-decision", detail: `Routing ${decision.id} via ${decision.strategy}, confidence ${decision.confidence}.` },
    { subject: "execution-mode", detail: `Execution mode ${context.executionMode}, simulation=${context.simulation}.` },
    { subject: "retry", detail: `Retry maxAttempts=${retry.maxAttempts}, backoff ${retry.baseDelayMs}ms×${retry.multiplier}.` },
    { subject: "timeout", detail: `Timeout ${timeout.timeoutMs}ms (hard cap ${timeout.hardCapMs}ms).` },
    { subject: "rollback", detail: `Rollback ${rollback.enabled ? rollback.strategy : "disabled"}.` },
    { subject: "telemetry", detail: `Latency ~${decision.estimatedLatencyMs}ms, reliability ${decision.estimatedReliability}.` },
    { subject: "artifacts", detail: `${artifactCount} artifact contracts declared.` },
  ];
}
