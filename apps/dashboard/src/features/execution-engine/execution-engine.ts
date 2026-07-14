import type { CommandPlan } from "@/features/execution-bridge";
import { formatDuration } from "@/features/task-planning";
import { simulateApprovalGates } from "./approval-gates";
import { buildExecutionEngineHistory, buildExecutionEngineTelemetry, buildSimulationReport, buildSimulationTimeline } from "./execution-report";
import { buildExecutionQueue } from "./execution-scheduler";
import { deriveSimulationState } from "./execution-state";
import { runExecutionSimulation } from "./execution-runner";
import type { ExecutionEngineResult, ExecutionSimulation } from "./types";

function buildSummary(simulation: Omit<ExecutionSimulation, "summary" | "report" | "state">) {
  const items = simulation.queue.items;
  const completed = items.filter((item) => item.state === "completed").length;
  const blocked = items.filter((item) => item.state === "blocked").length;
  const waiting = items.filter((item) =>
    ["waiting-approval", "waiting-dependencies", "pending", "ready", "running"].includes(item.state)
  ).length;
  const failed = items.filter((item) => item.state === "failed").length;
  const skipped = items.filter((item) => item.state === "skipped").length;

  return {
    totalCommands: items.length,
    completed,
    blocked,
    waiting,
    failed,
    skipped,
    completionPercent:
      items.length === 0 ? 0 : Math.round((completed / items.length) * 100),
    readiness: simulation.executionPlan.summary.readiness,
    criticalPathLength: simulation.commandPlan.dependencyGraph.criticalPath.length,
    estimatedDuration: simulation.commandPlan.estimatedDuration,
    estimatedDurationLabel: formatDuration(simulation.commandPlan.estimatedDuration),
  };
}

export function buildExecutionSimulation(plan: CommandPlan): ExecutionEngineResult {
  const queueSeed = buildExecutionQueue(plan);
  const approvals = simulateApprovalGates(plan);
  const queueItems = runExecutionSimulation(plan, queueSeed, approvals);
  const queue = { items: queueItems };
  const timeline = buildSimulationTimeline(plan, queueItems);

  const partial: Omit<ExecutionSimulation, "summary" | "report" | "state"> = {
    id: `simulation-${plan.id}`,
    planId: plan.id,
    commandPlan: plan,
    executionPlan: plan.executionPlan,
    queue,
    approvals,
    timeline,
    validation: plan.validation,
  };

  const summary = buildSummary(partial);
  const state = deriveSimulationState({ ...partial, summary, report: {} as never, state: "pending" });
  const report = buildSimulationReport({
    queue,
    summary,
  });

  const simulation: ExecutionSimulation = {
    ...partial,
    summary,
    report,
    state,
  };

  return {
    simulation,
    telemetry: buildExecutionEngineTelemetry(simulation),
    history: buildExecutionEngineHistory(simulation),
  };
}

