/*
 * offline-telemetry.ts — deterministic session telemetry aggregated over task
 * runs.
 */

import type { OfflineTaskRun, OfflineTelemetry } from "@/features/offline-execution/types";

export function buildTelemetry(runs: OfflineTaskRun[]): OfflineTelemetry {
  const taskCount = runs.length;
  const gatesPassedTotal = runs.reduce((s, r) => s + r.result.telemetry.gatesPassed, 0);
  return {
    taskCount,
    routedCount: runs.filter((r) => r.routing.primaryProvider).length,
    invokedCount: runs.filter((r) => r.invocation.status === "Ready").length,
    runtimeEvaluatedCount: runs.filter((r) => r.result.telemetry.runtimeEvaluated).length,
    simulatedResultCount: runs.filter((r) => r.result.status === "simulated").length,
    simulationEnforcedCount: runs.filter((r) => r.simulationEnforced).length,
    traceableCount: runs.filter((r) => r.traceable).length,
    averageGatesPassed: taskCount === 0 ? 0 : Math.round(gatesPassedTotal / taskCount),
  };
}
