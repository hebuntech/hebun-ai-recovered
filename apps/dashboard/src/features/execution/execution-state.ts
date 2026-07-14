import type { ExecutionState } from "@/features/execution/types";

export const executionStateOrder: ExecutionState[] = [
  "pending",
  "queued",
  "ready",
  "running",
  "waiting",
  "blocked",
  "retrying",
  "paused",
  "completed",
  "cancelled",
  "rolled-back",
  "failed",
  "timed-out",
];

export const executionStateLabels: Record<ExecutionState, string> = {
  pending: "Pending",
  queued: "Queued",
  ready: "Ready",
  running: "Running",
  waiting: "Waiting",
  blocked: "Blocked",
  retrying: "Retrying",
  paused: "Paused",
  completed: "Completed",
  cancelled: "Cancelled",
  "rolled-back": "Rolled Back",
  failed: "Failed",
  "timed-out": "Timed Out",
};

export function isTerminalExecutionState(state: ExecutionState) {
  return ["completed", "cancelled", "rolled-back", "failed", "timed-out"].includes(state);
}
