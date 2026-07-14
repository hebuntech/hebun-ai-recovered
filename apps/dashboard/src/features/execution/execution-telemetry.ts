import type { ExecutionSession, ExecutionTelemetry } from "@/features/execution/types";
import { cancellationCount } from "@/features/execution/cancellation-engine";

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes}m`;
  return `${hours}h ${remainingMinutes}m`;
}

export function buildExecutionTelemetry(
  session: Pick<
    ExecutionSession,
    "executionState" | "progress" | "retryCount" | "rollbackCount"
  >
): ExecutionTelemetry {
  const executionDurationMinutes =
    session.executionState === "completed"
      ? 42
      : session.executionState === "running"
        ? 28
        : session.executionState === "retrying"
          ? 36
          : session.executionState === "failed" || session.executionState === "timed-out"
            ? 31
            : 18;
  const failureCount =
    session.executionState === "failed" || session.executionState === "timed-out"
      ? Math.max(1, session.progress.failedTasks)
      : 0;
  const completionRate =
    session.executionState === "completed" ? 100 : session.progress.completionRate;
  const successRate = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        completionRate * 0.55 +
          (100 - failureCount * 20) * 0.25 +
          (100 - session.retryCount * 8) * 0.2
      )
    )
  );

  return {
    executionDuration: formatDuration(executionDurationMinutes),
    executionDurationMinutes,
    queueTime:
      session.executionState === "queued" || session.executionState === "pending"
        ? "12m"
        : "4m",
    retryCount: session.retryCount,
    failureCount,
    rollbackCount: session.rollbackCount,
    cancellationCount: cancellationCount(session.executionState),
    successRate,
    completionRate,
    averageTaskTime: `${Math.max(6, Math.round(executionDurationMinutes / Math.max(session.progress.totalTasks, 1)))}m`,
  };
}
