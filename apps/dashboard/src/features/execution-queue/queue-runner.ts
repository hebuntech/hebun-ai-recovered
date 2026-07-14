/*
 * Execution Queue — runner.
 *
 * Advances queued entries to their deterministic terminal state through a fixed
 * sequence of validated operations. The terminal target is inherited from Live
 * Dispatch (`plannedOutcome`), so the run is fully deterministic: same seed →
 * same operations → same final states and history. No timers, no async, no
 * randomness — each step is a synchronous, validated service call.
 *
 * Op sequences:
 *   completed → start → dequeue → complete
 *   failed    → start → dequeue → fail → retry → start → dequeue → fail
 *               (ends failed with retryCount = 1)
 */

import { applyOperation } from "./queue-engine";
import { getEntriesByAgent } from "./queue-store";
import type { ExecutionQueueEntry, QueueOperation } from "./types";

const COMPLETED_FLOW: QueueOperation[] = ["start", "dequeue", "complete"];
const FAILED_FLOW: QueueOperation[] = [
  "start",
  "dequeue",
  "fail",
  "retry",
  "start",
  "dequeue",
  "fail",
];

/** Drive a single entry to its planned terminal state. */
export function runEntry(entry: ExecutionQueueEntry): void {
  const flow = entry.plannedOutcome === "failed" ? FAILED_FLOW : COMPLETED_FLOW;
  for (const op of flow) {
    applyOperation(entry.id, op);
  }
}

/**
 * Advance every currently-`queued` entry for an agent. Waiting entries
 * (approval / dependencies) are intentionally left untouched — they cannot run
 * until their gate is resolved.
 */
export function advanceAgentQueue(agentId: string): void {
  const queued = getEntriesByAgent(agentId).filter((entry) => entry.state === "queued");
  for (const entry of queued) {
    runEntry(entry);
  }
}
