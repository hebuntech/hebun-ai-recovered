/*
 * Execution Queue — engine.
 *
 * Two responsibilities:
 *   1. Seed an agent's queue ONCE from the deterministic Live Dispatch result.
 *   2. Apply validated operations that move entries through the lifecycle.
 *
 * All mutation goes through the stateful store. Every transition is validated
 * against the transition graph; illegal ones are rejected and leave state and
 * history untouched. Deterministic and synchronous — no clock, no async.
 */

import { getAgentLiveDispatch } from "@/features/live-dispatch";
import {
  addEntries,
  commit,
  getEntry,
  isSeeded,
  markSeeded,
  nextSeq,
  recordTransition,
  replaceEntry,
} from "./queue-store";
import { defaultReason, operationTarget, canTransition } from "./queue-transitions";
import type {
  ExecutionQueueEntry,
  ExecutionState,
  QueueOperation,
  TransitionOutcome,
  TransitionRecord,
} from "./types";

function queueIdFor(agentId: string): string {
  return `queue_${agentId}`;
}

/**
 * Seed the queue for an agent, exactly once. Accepted commands enter as
 * `queued`; approval- / dependency-waiting rejects enter in their waiting state
 * so the queue reflects the whole dispatch picture. Idempotent: a second call is
 * a no-op, which is what keeps the queue stateful across re-renders.
 */
export function seedAgentQueue(agentId: string): void {
  if (isSeeded(agentId)) return;

  const dispatch = getAgentLiveDispatch(agentId);
  if (!dispatch) {
    markSeeded(agentId);
    return;
  }

  const queueId = queueIdFor(agentId);
  const seeded: ExecutionQueueEntry[] = [];

  // Accepted → queued.
  dispatch.queue.forEach((item) => {
    const plannedOutcome = item.state === "failed" ? "failed" : "completed";
    seeded.push({
      id: item.dispatchId,
      queueId,
      dispatchId: item.dispatchId,
      commandId: item.commandId,
      commandType: item.commandType,
      commandLabel: item.commandLabel,
      title: item.title,
      agentId,
      agentName: item.agentName,
      priority: item.priority,
      queuePosition: item.queuePosition,
      state: "queued",
      retryCount: 0,
      plannedOutcome,
      history: [],
      traceability: item.traceability,
    });
  });

  // Approval- / dependency-waiting rejects enter the queue in a waiting state.
  let waitIndex = 0;
  dispatch.rejected.forEach((item) => {
    const waitingState: ExecutionState | null =
      item.reason === "approval-pending"
        ? "waiting-approval"
        : item.reason === "dependencies-incomplete"
          ? "waiting-dependencies"
          : null;
    if (!waitingState) return;
    waitIndex += 1;
    const dispatchId = `wait_${agentId}_${String(waitIndex).padStart(4, "0")}`;
    seeded.push({
      id: dispatchId,
      queueId,
      dispatchId,
      commandId: item.commandId,
      commandType: item.commandType,
      commandLabel: item.commandLabel,
      title: item.title,
      agentId,
      agentName: item.agentName,
      priority: item.priority,
      queuePosition: dispatch.queue.length + waitIndex,
      state: waitingState,
      retryCount: 0,
      plannedOutcome: "completed",
      history: [],
      traceability: item.traceability,
    });
  });

  // Record the enqueue transition for each seeded entry.
  seeded.forEach((entry) => {
    const record: TransitionRecord = {
      queueId,
      dispatchId: entry.dispatchId,
      commandId: entry.commandId,
      operation: "enqueue",
      from: null,
      to: entry.state,
      reason: defaultReason("enqueue"),
      seq: nextSeq(),
    };
    entry.history.push(record);
    recordTransition(record);
  });

  addEntries(seeded);
  markSeeded(agentId);
  commit();
}

/**
 * Apply one operation to one entry. Returns a TransitionOutcome; on an illegal
 * operation the outcome is `rejected` and nothing mutates.
 */
export function applyOperation(
  entryId: string,
  op: QueueOperation,
  reason?: string
): TransitionOutcome {
  const entry = getEntry(entryId);
  if (!entry) {
    return { ok: false, from: null, to: null, reason: `Unknown entry ${entryId}.` };
  }

  const target = operationTarget(op, entry.state);
  if (target === null || !canTransition(entry.state, target)) {
    return {
      ok: false,
      from: entry.state,
      to: null,
      reason: `Illegal transition: ${op} from ${entry.state}.`,
      rejected: true,
    };
  }

  const record: TransitionRecord = {
    queueId: entry.queueId,
    dispatchId: entry.dispatchId,
    commandId: entry.commandId,
    operation: op,
    from: entry.state,
    to: target,
    reason: reason ?? defaultReason(op),
    seq: nextSeq(),
  };

  const updated: ExecutionQueueEntry = {
    ...entry,
    state: target,
    retryCount: op === "retry" ? entry.retryCount + 1 : entry.retryCount,
    history: [...entry.history, record],
  };

  replaceEntry(updated);
  recordTransition(record);
  commit();

  return { ok: true, from: entry.state, to: target, reason: record.reason };
}
