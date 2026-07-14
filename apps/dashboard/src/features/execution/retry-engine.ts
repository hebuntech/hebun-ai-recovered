import type { ExecutionSession, ExecutionState } from "@/features/execution/types";
import type { OrchestrationBlueprint } from "@/features/orchestration";

export function determineRetryCount(
  blueprint: OrchestrationBlueprint,
  state: ExecutionState
) {
  const base =
    blueprint.fallbackStrategy.filter((item) => item.fallbackAgents.length > 0).length > 0
      ? 1
      : 0;

  if (state === "retrying") return base + 2;
  if (state === "failed" || state === "timed-out") return base + 1;
  return base;
}

export function retrySummary(session: ExecutionSession) {
  if (session.retryCount === 0) {
    return "No retry pressure is active in the current execution session.";
  }

  return `${session.retryCount} retries were reserved to preserve deterministic recovery without invoking any external execution adapter.`;
}
