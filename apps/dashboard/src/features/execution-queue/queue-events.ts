/*
 * Execution Queue — events projection.
 *
 * Turns transition records into a queue event stream. Pure: derived entirely
 * from the transitions, ordered by synthetic seq.
 */

import type { QueueEvent, QueueOperation, TransitionRecord } from "./types";

const EVENT_BY_OP: Record<QueueOperation, QueueEvent["type"]> = {
  enqueue: "queue.enqueued",
  dequeue: "queue.started",
  start: "queue.started",
  pause: "queue.paused",
  resume: "queue.resumed",
  retry: "queue.retried",
  complete: "queue.completed",
  fail: "queue.failed",
  cancel: "queue.cancelled",
  reset: "queue.reset",
};

export function buildEvents(history: TransitionRecord[]): QueueEvent[] {
  return history.map((record) => ({
    id: `evt_${record.dispatchId}_${record.seq}`,
    type: EVENT_BY_OP[record.operation],
    dispatchId: record.dispatchId,
    commandId: record.commandId,
    detail: `${record.from ?? "∅"} → ${record.to} (${record.reason})`,
    seq: record.seq,
  }));
}
