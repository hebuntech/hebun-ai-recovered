import type {
  ExecutionProgress,
  ExecutionSession,
} from "@/features/execution/types";
import { isTerminalExecutionState } from "@/features/execution/execution-state";

export interface ExecutionMonitorSnapshot {
  status: "healthy" | "watch" | "critical";
  summary: string;
  signals: string[];
}

export function buildExecutionProgress(
  taskIds: string[],
  state: ExecutionSession["executionState"]
): Pick<ExecutionSession, "completedTasks" | "failedTasks" | "progress"> {
  const totalTasks = taskIds.length;
  const completedCount =
    state === "completed"
      ? totalTasks
      : state === "queued" || state === "pending" || state === "ready"
        ? 0
        : state === "blocked" || state === "waiting" || state === "paused"
          ? Math.max(1, Math.floor(totalTasks * 0.4))
          : state === "failed" || state === "timed-out"
            ? Math.max(1, Math.floor(totalTasks * 0.5))
            : Math.max(1, Math.floor(totalTasks * 0.6));
  const failedCount =
    state === "failed" || state === "timed-out"
      ? Math.max(1, totalTasks - completedCount)
      : state === "retrying"
        ? 1
        : 0;
  const runningCount = state === "running" || state === "retrying" ? 1 : 0;
  const waitingCount =
    state === "queued" || state === "waiting" || state === "blocked" || state === "paused"
      ? Math.max(1, totalTasks - completedCount - failedCount)
      : Math.max(0, totalTasks - completedCount - failedCount - runningCount);

  const completedTasks = taskIds.slice(0, completedCount);
  const failedTasks = failedCount > 0 ? taskIds.slice(completedCount, completedCount + failedCount) : [];
  const completionRate = Math.round((completedCount / Math.max(totalTasks, 1)) * 100);
  const progress: ExecutionProgress = {
    totalTasks,
    completedTasks: completedCount,
    failedTasks: failedCount,
    runningTasks: runningCount,
    waitingTasks: waitingCount,
    completionRate: state === "completed" ? 100 : completionRate,
    currentStage: isTerminalExecutionState(state)
      ? "Summary and telemetry"
      : state === "queued"
        ? "Executor allocation"
        : state === "waiting"
          ? "Dependency or approval wait"
          : state === "blocked"
            ? "Blocker resolution"
            : state === "retrying"
              ? "Deterministic retry handling"
              : "Execution monitoring",
  };

  return { completedTasks, failedTasks, progress };
}

export function monitorExecutionSession(
  session: ExecutionSession
): ExecutionMonitorSnapshot {
  const signals = [
    `${session.progress.completionRate}% completion`,
    `${session.retryCount} retries reserved`,
    `${session.rollbackCount} rollback checkpoints used`,
  ];

  if (session.readiness.blockers.length > 0 || session.executionState === "failed") {
    return {
      status: "critical",
      summary: "Execution integrity is degraded by blockers, failures, or unresolved approvals.",
      signals,
    };
  }

  if (session.executionState === "running" || session.executionState === "completed") {
    return {
      status: "healthy",
      summary: "Execution is traceable, bounded, and progressing inside the deterministic control surface.",
      signals,
    };
  }

  return {
    status: "watch",
    summary: "Execution remains controlled, but it is waiting on readiness, coordination, or recovery conditions.",
    signals,
  };
}
