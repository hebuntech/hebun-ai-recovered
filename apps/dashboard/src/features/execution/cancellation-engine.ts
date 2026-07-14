import type { ExecutionState } from "@/features/execution/types";

export function cancellationCount(state: ExecutionState) {
  return state === "cancelled" ? 1 : 0;
}

export function cancellationSummary(state: ExecutionState) {
  return state === "cancelled"
    ? "The execution session was intentionally cancelled before work completion."
    : "No execution cancellation is active in the current session.";
}
