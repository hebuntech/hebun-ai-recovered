import { formatDuration } from "@/features/task-planning";
import type { CommandPlan } from "@/features/execution-bridge";
import type {
  ExecutionEngineHistoryEntry,
  ExecutionEngineTelemetry,
  ExecutionSimulation,
  SimulatedExecutionCommand,
  SimulatedExecutionReport,
  SimulatedExecutionTimelineStage,
} from "./types";

export function buildSimulationTimeline(
  plan: CommandPlan,
  commands: SimulatedExecutionCommand[]
): SimulatedExecutionTimelineStage[] {
  return plan.executionOrder.map((stage) => {
    const stageCommands = commands.filter((command) => command.stageOrder === stage.order);
    const completedCount = stageCommands.filter((command) => command.state === "completed").length;
    const blockedCount = stageCommands.filter((command) =>
      ["blocked", "waiting-approval", "waiting-dependencies", "failed"].includes(command.state)
    ).length;
    const progress =
      stageCommands.length === 0
        ? 0
        : Math.round((completedCount / stageCommands.length) * 100);

    let state: SimulatedExecutionTimelineStage["state"] = "pending";
    if (stageCommands.every((command) => command.state === "completed")) state = "completed";
    else if (stageCommands.some((command) => command.state === "failed")) state = "failed";
    else if (stageCommands.some((command) => command.state === "blocked")) state = "blocked";
    else if (stageCommands.some((command) => command.state === "waiting-approval")) state = "waiting-approval";
    else if (stageCommands.some((command) => command.state === "waiting-dependencies")) state = "waiting-dependencies";

    return {
      order: stage.order,
      label: stage.label,
      commandIds: stage.commandIds,
      estimatedDuration: stage.estimatedDuration,
      state,
      completedCount,
      blockedCount,
      progress,
    };
  });
}

export function buildSimulationReport(
  simulation: Pick<ExecutionSimulation, "queue" | "summary">
): SimulatedExecutionReport {
  return {
    executionQueue: simulation.queue,
    completed: simulation.summary.completed,
    blocked: simulation.summary.blocked,
    waiting: simulation.summary.waiting,
    failed: simulation.summary.failed,
    estimatedProgress: simulation.summary.completionPercent,
    estimatedCompletion: simulation.summary.estimatedDurationLabel,
    executionSummary: `${simulation.summary.completed}/${simulation.summary.totalCommands} command(s) completed · ${simulation.summary.waiting} waiting · ${simulation.summary.blocked} blocked · ${simulation.summary.failed} failed`,
  };
}

export function buildExecutionEngineTelemetry(
  simulation: ExecutionSimulation
): ExecutionEngineTelemetry {
  return {
    queuedCommands: simulation.summary.totalCommands,
    completedCommands: simulation.summary.completed,
    blockedCommands: simulation.summary.blocked,
    waitingCommands: simulation.summary.waiting,
    failedCommands: simulation.summary.failed,
    approvalCount: simulation.approvals.length,
    historyCount: 5,
  };
}

export function buildExecutionEngineHistory(
  simulation: ExecutionSimulation
): ExecutionEngineHistoryEntry[] {
  return [
    {
      id: `${simulation.id}-queue`,
      stage: "queue",
      detail: `${simulation.summary.totalCommands} command(s) placed into the execution queue.`,
    },
    {
      id: `${simulation.id}-dependency-check`,
      stage: "dependency-check",
      detail: `${simulation.commandPlan.dependencyGraph.nodes.length} dependency node(s) checked against the queue.`,
    },
    {
      id: `${simulation.id}-approval-gates`,
      stage: "approval-gates",
      detail: `${simulation.approvals.length} approval gate(s) simulated.`,
    },
    {
      id: `${simulation.id}-simulation`,
      stage: "simulation",
      detail: `${simulation.summary.completed} completed, ${simulation.summary.waiting} waiting, ${simulation.summary.blocked} blocked, ${simulation.summary.failed} failed.`,
    },
    {
      id: `${simulation.id}-report`,
      stage: "report",
      detail: `Estimated progress ${simulation.summary.completionPercent}% · completion ${formatDuration(simulation.summary.estimatedDuration)}.`,
    },
  ];
}

