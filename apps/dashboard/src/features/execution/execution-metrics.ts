import { executionSessions } from "@/features/execution/execution-pipeline";
import { latestExecutionSession } from "@/features/execution/execution-queries";
import type { ExecutionMetrics } from "@/features/execution/types";

const runningSessions = executionSessions.filter(
  (session) => session.executionState === "running" || session.executionState === "retrying"
).length;
const queuedSessions = executionSessions.filter(
  (session) =>
    session.executionState === "queued" ||
    session.executionState === "pending" ||
    session.executionState === "ready"
).length;
const completedSessions = executionSessions.filter(
  (session) => session.executionState === "completed"
).length;
const failedSessions = executionSessions.filter(
  (session) =>
    session.executionState === "failed" ||
    session.executionState === "timed-out" ||
    session.executionState === "rolled-back"
).length;
const openSessions = executionSessions.length - completedSessions;
const retryRate = Math.round(
  (executionSessions.filter((session) => session.retryCount > 0).length /
    Math.max(executionSessions.length, 1)) *
    100
);
const averageDurationMinutes = Math.round(
  executionSessions.reduce(
    (sum, session) => sum + session.telemetry.executionDurationMinutes,
    0
  ) / Math.max(executionSessions.length, 1)
);
const averageConfidence = Math.round(
  executionSessions.reduce((sum, session) => sum + session.confidence, 0) /
    Math.max(executionSessions.length, 1)
);
const executionHealth = Math.max(
  0,
  Math.min(
    100,
    Math.round(
      averageConfidence * 0.45 +
        completedSessions * 10 +
        runningSessions * 8 -
        failedSessions * 10 -
        retryRate * 0.2
    )
  )
);

export const executionMetrics: ExecutionMetrics = {
  runningSessions,
  queuedSessions,
  completedSessions,
  failedSessions,
  retryRate,
  executionHealth,
  averageDuration: `${averageDurationMinutes}m`,
  openSessions,
  averageConfidence,
  latestSummary: latestExecutionSession()?.summary.outcome ?? "No execution sessions",
  healthBadge:
    executionHealth >= 90 ? "success" : executionHealth >= 82 ? "warning" : "error",
};
