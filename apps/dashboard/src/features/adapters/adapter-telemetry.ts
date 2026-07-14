import type { ExecutionResult, ExecutionTelemetry } from "@/features/adapters/types";

/*
 * Telemetry bridge — deterministic aggregation of execution results into an
 * adapter's telemetry record. In later phases the real telemetry service
 * consumes this same shape.
 */
export function aggregateTelemetry(results: ExecutionResult[], lastUpdated: string): ExecutionTelemetry {
  const executions = results.length;
  const succeeded = results.filter((r) => r.outcome === "succeeded" || r.outcome === "simulated").length;
  const failed = results.filter((r) => r.outcome === "failed").length;
  const cancelled = results.filter((r) => r.outcome === "cancelled").length;
  const averageDurationMs = executions
    ? Math.round(results.reduce((sum, r) => sum + r.durationMs, 0) / executions)
    : 0;
  return { executions, succeeded, failed, cancelled, averageDurationMs, lastUpdated };
}
