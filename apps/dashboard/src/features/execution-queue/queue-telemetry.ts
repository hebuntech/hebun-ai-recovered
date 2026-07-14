/*
 * Execution Queue — telemetry.
 *
 * Deterministic counters derived from a set of entries. Pure projection.
 */

import { isTerminal } from "./queue-transitions";
import type { ExecutionQueueEntry, QueueTelemetry } from "./types";

function count(entries: ExecutionQueueEntry[], state: ExecutionQueueEntry["state"]): number {
  return entries.filter((entry) => entry.state === state).length;
}

export function buildTelemetry(entries: ExecutionQueueEntry[]): QueueTelemetry {
  const completed = count(entries, "completed");
  const failed = count(entries, "failed");
  const cancelled = count(entries, "cancelled");
  const settled = completed + failed + cancelled;
  const throughput = settled === 0 ? 0 : Math.round((completed / settled) * 100);
  const queueDepth = entries.filter((entry) => !isTerminal(entry.state)).length;
  const transitionCount = entries.reduce((sum, entry) => sum + entry.history.length, 0);

  return {
    queued: count(entries, "queued"),
    running: count(entries, "executing"),
    paused: count(entries, "paused"),
    retrying: count(entries, "retrying"),
    completed,
    failed,
    cancelled,
    throughput,
    queueDepth,
    transitionCount,
  };
}
