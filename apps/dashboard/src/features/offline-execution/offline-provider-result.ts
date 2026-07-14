/*
 * offline-provider-result.ts — produces a DETERMINISTIC simulated provider
 * result from the runtime decision + invocation. Never executes a provider,
 * calls an API, mutates a file, or runs a command. The "output" is a contract
 * projection, not real model output.
 */

import type { Invocation } from "@/features/provider-invocation";
import type { RuntimeDecision } from "@/features/runtime-boundary";
import type { PlanTask } from "@/features/planning";
import type {
  SimulatedProviderResult,
  SimulatedResultStatus,
  TaskTelemetry,
} from "@/features/offline-execution/types";

const EPOCH = "2025-01-01T00:00:00.000Z";

export function simulateResult(
  task: PlanTask,
  invocation: Invocation,
  runtime: RuntimeDecision,
  telemetry: TaskTelemetry
): SimulatedProviderResult {
  const status: SimulatedResultStatus = runtime.blocked
    ? runtime.runtimeMode === "Blocked"
      ? "blocked"
      : "held"
    : "simulated";

  const artifacts = invocation.artifacts.map((a) => ({ kind: a.kind, label: a.label }));

  const output =
    status === "simulated"
      ? `Simulated ${invocation.providerId ?? "provider"} output for "${task.title}" (${runtime.runtimeMode}): ${invocation.expectedResponse.summary}`
      : `No simulated output produced — held on the offline side (${runtime.blockReasons[0] ?? "runtime boundary"}).`;

  return {
    id: `sim-${task.id}`,
    taskId: task.id,
    providerId: invocation.providerId,
    providerType: invocation.providerType,
    status,
    summary:
      status === "simulated"
        ? `${invocation.providerId ?? "provider"} would satisfy "${task.title}" in ${runtime.runtimeMode} mode.`
        : `"${task.title}" not simulated — ${runtime.runtimeMode}.`,
    output,
    artifacts,
    warnings: invocation.expectedResponse.warnings,
    errors: status === "blocked" ? ["No provider available for this task."] : [],
    events: invocation.events.map((e) => e.label),
    telemetry,
    confidence: runtime.confidence,
    createdAt: EPOCH,
  };
}
