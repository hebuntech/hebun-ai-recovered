import type { ExecutionState } from "@/features/execution/types";

export function timeoutCount(state: ExecutionState) {
  return state === "timed-out" ? 1 : 0;
}

export function timeoutSummary(state: ExecutionState) {
  return state === "timed-out"
    ? "The session exceeded its deterministic time window and was closed without calling any provider."
    : "No execution timeout was triggered for the current session.";
}
