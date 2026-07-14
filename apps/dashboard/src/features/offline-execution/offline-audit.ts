/*
 * offline-audit.ts — audits every stage of the end-to-end offline pipeline.
 */

import type { OfflineExecutionContext } from "@/features/offline-execution/offline-execution-context";
import type { OfflineAuditRecord, OfflineTaskRun } from "@/features/offline-execution/types";

export function buildAudit(
  context: OfflineExecutionContext,
  runs: OfflineTaskRun[]
): OfflineAuditRecord[] {
  const routed = runs.filter((r) => r.routing.primaryProvider).length;
  const simulated = runs.filter((r) => r.result.status === "simulated").length;
  const enforced = runs.every((r) => r.simulationEnforced);
  const anyLive = runs.some((r) => r.runtime.allowed && r.runtimeMode === "Future Live");

  return [
    { stage: "planning-input", detail: `Plan ${context.planId} with ${context.tasks.length} tasks.` },
    { stage: "orchestration-input", detail: `Orchestration ${context.orchestrationId} (${context.orchestration.coordinationStrategy}).` },
    { stage: "execution-request", detail: `${runs.length} execution requests built from plan tasks.` },
    { stage: "provider-routing", detail: `${routed}/${runs.length} tasks routed to a primary provider.` },
    { stage: "provider-invocation", detail: `${runs.filter((r) => r.invocation.status === "Ready").length} invocations prepared.` },
    { stage: "runtime-decision", detail: `${runs.length} runtime decisions evaluated at the boundary.` },
    { stage: "simulation-enforcement", detail: enforced ? "Simulation enforced for every task." : "Simulation NOT enforced." },
    { stage: "simulated-result", detail: `${simulated}/${runs.length} simulated results produced.` },
    { stage: "final-report", detail: anyLive ? "INVARIANT VIOLATION: live crossing detected." : "No live crossing. Future Live remains blocked." },
  ];
}
