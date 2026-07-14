/*
 * offline-events.ts — deterministic session event stream. Fixed timestamps.
 */

import type { OfflineEvent, OfflineTaskRun, OfflineSessionStatus } from "@/features/offline-execution/types";

const EPOCH = "2025-01-01T00:00:00.000Z";

export function buildEvents(
  planId: string,
  orchestrationId: string,
  runs: OfflineTaskRun[],
  status: OfflineSessionStatus
): OfflineEvent[] {
  const events: OfflineEvent[] = [
    { type: "Session Created", label: "Session Created", at: EPOCH, note: `Plan ${planId} · Orchestration ${orchestrationId}.` },
  ];

  for (const run of runs) {
    events.push(
      { type: "Task Selected", label: `Task ${run.taskId}`, at: EPOCH, note: run.taskTitle },
      { type: "Provider Routed", label: "Routed", at: EPOCH, note: `${run.capability} → ${run.routing.primaryProvider ?? "none"}.` },
      { type: "Invocation Built", label: "Invoked", at: EPOCH, note: `Invocation ${run.invocation.status}.` },
      { type: "Runtime Evaluated", label: "Runtime", at: EPOCH, note: `Mode ${run.runtimeMode}, ${run.runtime.allowed ? "allowed(offline)" : "held"}.` },
      { type: "Simulation Enforced", label: "Simulation", at: EPOCH, note: run.simulationEnforced ? "Simulation enforced." : "NOT enforced." },
      { type: "Result Produced", label: "Result", at: EPOCH, note: `${run.result.status}.` }
    );
  }

  events.push(
    status === "blocked"
      ? { type: "Session Blocked", label: "Session Blocked", at: EPOCH, note: "One or more tasks could not be simulated." }
      : { type: "Session Completed", label: "Session Completed", at: EPOCH, note: "End-to-end offline execution complete." }
  );

  return events;
}
