/*
 * invocation-telemetry.ts — deterministic invocation telemetry derived from the
 * decision and resolved policies. No live counters — contract projections only.
 */

import type { RetryPolicy } from "@/features/adapters";
import type { RoutingDecision } from "@/features/provider-routing";
import type {
  InvocationExecutionMode,
  InvocationTelemetry,
  RollbackPolicy,
  TimeoutPolicy,
} from "@/features/provider-invocation/types";

export function buildTelemetry(
  decision: RoutingDecision,
  mode: InvocationExecutionMode,
  retry: RetryPolicy,
  timeout: TimeoutPolicy,
  rollback: RollbackPolicy,
  prepared: boolean
): InvocationTelemetry {
  return {
    prepared: prepared ? 1 : 0,
    simulated: mode === "Simulation" ? 1 : 0,
    retriesConfigured: retry.maxAttempts,
    timeoutMs: timeout.timeoutMs,
    rollbackEnabled: rollback.enabled,
    estimatedLatencyMs: decision.estimatedLatencyMs,
    estimatedReliability: decision.estimatedReliability,
  };
}
