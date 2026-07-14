/*
 * Execution Queue — transition rules.
 *
 * The single source of truth for the queue lifecycle graph. Every operation is
 * validated against this graph; illegal transitions are rejected, never applied.
 * Pure and deterministic — no state, no clock.
 *
 * Legal graph:
 *   queued               → preparing, cancelled
 *   preparing            → executing, waiting-approval, waiting-dependencies,
 *                          paused, failed, cancelled
 *   executing            → completed, failed, paused, cancelled
 *   paused               → executing, cancelled
 *   waiting-approval     → preparing, cancelled, failed
 *   waiting-dependencies → preparing, cancelled, failed
 *   retrying             → preparing, cancelled
 *   completed            → queued            (reset only)
 *   failed               → retrying, queued, cancelled
 *   cancelled            → queued            (reset only)
 */

import type { ExecutionState, QueueOperation } from "./types";

const LEGAL: Record<ExecutionState, ExecutionState[]> = {
  queued: ["preparing", "cancelled"],
  preparing: [
    "executing",
    "waiting-approval",
    "waiting-dependencies",
    "paused",
    "failed",
    "cancelled",
  ],
  executing: ["completed", "failed", "paused", "cancelled"],
  paused: ["executing", "cancelled"],
  "waiting-approval": ["preparing", "cancelled", "failed"],
  "waiting-dependencies": ["preparing", "cancelled", "failed"],
  retrying: ["preparing", "cancelled"],
  completed: ["queued"],
  failed: ["retrying", "queued", "cancelled"],
  cancelled: ["queued"],
};

const TERMINAL: ExecutionState[] = ["completed", "failed", "cancelled"];

export function isTerminal(state: ExecutionState): boolean {
  return TERMINAL.includes(state);
}

/** Can the graph move directly from `from` to `to`? */
export function canTransition(from: ExecutionState, to: ExecutionState): boolean {
  return LEGAL[from]?.includes(to) ?? false;
}

/**
 * Map an operation to its target state given the current state. Returns null
 * when the operation is not valid from the current state — the caller rejects.
 */
export function operationTarget(
  op: QueueOperation,
  from: ExecutionState
): ExecutionState | null {
  switch (op) {
    case "enqueue":
      // Only meaningful for a brand-new entry; never a transition of an
      // existing one. Handled by the store, not the transition graph.
      return null;
    case "start":
      return from === "queued" ||
        from === "retrying" ||
        from === "waiting-approval" ||
        from === "waiting-dependencies"
        ? "preparing"
        : null;
    case "dequeue":
      return from === "preparing" ? "executing" : null;
    case "pause":
      return from === "executing" || from === "preparing" ? "paused" : null;
    case "resume":
      return from === "paused" ? "executing" : null;
    case "complete":
      return from === "executing" ? "completed" : null;
    case "fail":
      return from === "executing" || from === "preparing" ? "failed" : null;
    case "retry":
      return from === "failed" ? "retrying" : null;
    case "cancel":
      return isTerminal(from) ? null : "cancelled";
    case "reset":
      return isTerminal(from) ? "queued" : null;
    default:
      return null;
  }
}

/** Default human-readable reason for an operation. */
export function defaultReason(op: QueueOperation): string {
  const reasons: Record<QueueOperation, string> = {
    enqueue: "Enqueued from Live Dispatch.",
    dequeue: "Dequeued into execution.",
    start: "Started preparing.",
    pause: "Paused by operator.",
    resume: "Resumed execution.",
    retry: "Retry requested after failure.",
    cancel: "Cancelled by operator.",
    complete: "Execution completed internally.",
    fail: "Execution failed on deterministic signal.",
    reset: "Reset back to queued.",
  };
  return reasons[op];
}
