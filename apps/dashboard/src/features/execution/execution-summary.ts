import type { ExecutionSession, ExecutionSummaryRecord } from "@/features/execution/types";

export function buildExecutionSummary(
  session: ExecutionSession
): ExecutionSummaryRecord {
  const headline = `${session.orchestration.plan.title} execution session`;
  const outcome =
    session.executionState === "completed"
      ? "Completed with full telemetry"
      : session.executionState === "running"
        ? "Running under monitored control"
        : session.executionState === "retrying"
          ? "Recovering through bounded retries"
          : session.executionState === "failed"
            ? "Failed with explainable trace"
            : session.executionState === "queued"
              ? "Queued for abstract executor allocation"
              : "Held in controlled readiness";
  const nextStep =
    session.executionState === "completed"
      ? "Promote summary, telemetry, and outcomes into future downstream learning layers."
      : session.executionState === "failed"
        ? "Resolve blockers, re-validate the orchestration blueprint, and regenerate the session."
        : session.executionState === "queued"
          ? "Allocate abstract executors and move into readiness validation."
          : "Continue lifecycle monitoring and bounded control actions.";

  return {
    headline,
    outcome,
    nextStep,
    explanation: `${session.readiness.summary} ${session.orchestration.explanation.summary}`,
  };
}
