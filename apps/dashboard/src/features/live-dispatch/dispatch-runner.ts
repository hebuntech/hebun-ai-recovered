/*
 * Live Dispatch — the runner.
 *
 * Advances each prepared command through the deterministic queue lifecycle and
 * emits the matching events. Execution is fully synchronous: no timers, no async
 * workers, no wall clock. A single monotonic `tick` counter is the only clock —
 * it increments once per lifecycle transition, in queue order, so timestamps are
 * a stable synthetic sequence ("t00000", "t00001", …). Same input → same ticks.
 */

import type {
  DispatchEvent,
  DispatchLifecycleEntry,
  DispatchQueueItem,
  QueueState,
} from "./types";
import type { PreparedDispatch } from "./dispatch-queue";

/** The transient states every accepted command passes through, in order. */
const TRANSIENT_FLOW: QueueState[] = [
  "queued",
  "preparing",
  "dispatched",
  "executing",
];

const STATE_DETAIL: Record<QueueState, string> = {
  queued: "Enqueued on the internal live-dispatch queue.",
  preparing: "Preparing payload and reusing the Command Bus lifecycle.",
  dispatched: "Dispatched to the internal offline execution backbone.",
  executing: "Executing synchronously inside Hebun AI (offline).",
  completed: "Completed internally. No external side effects.",
  failed: "Settled as failed by deterministic pre-dispatch signals.",
  cancelled: "Cancelled before settlement.",
};

function stamp(tick: number): string {
  return `t${String(tick).padStart(5, "0")}`;
}

const EVENT_BY_TERMINAL: Record<QueueState, DispatchEvent["type"]> = {
  completed: "command.completed",
  failed: "command.failed",
  cancelled: "command.cancelled",
  queued: "command.completed",
  preparing: "command.completed",
  dispatched: "command.completed",
  executing: "command.completed",
};

export interface RunResult {
  queue: DispatchQueueItem[];
  events: DispatchEvent[];
  endTick: number;
}

/**
 * Drive prepared commands to their terminal state. Each command consumes a
 * contiguous block of ticks (queued → preparing → dispatched → executing →
 * terminal), so the whole queue occupies a deterministic tick range.
 */
export function runDispatch(prepared: PreparedDispatch[]): RunResult {
  let tick = 0;
  const queue: DispatchQueueItem[] = [];
  const events: DispatchEvent[] = [];

  for (const item of prepared) {
    const lifecycle: DispatchLifecycleEntry[] = [];
    let queuedAt = "";
    let dispatchedAt = "";

    for (const state of TRANSIENT_FLOW) {
      const at = stamp(tick);
      lifecycle.push({ state, detail: STATE_DETAIL[state], tick, at });
      if (state === "queued") queuedAt = at;
      if (state === "dispatched") dispatchedAt = at;
      tick += 1;
    }

    // Terminal transition.
    const terminalAt = stamp(tick);
    lifecycle.push({
      state: item.terminalState,
      detail: STATE_DETAIL[item.terminalState],
      tick,
      at: terminalAt,
    });

    events.push({
      id: `evt_${item.dispatchId}_queued`,
      type: "command.queued",
      commandId: item.commandId,
      detail: `Queued at position ${item.queuePosition}.`,
      tick: lifecycle[0].tick,
    });
    events.push({
      id: `evt_${item.dispatchId}_dispatched`,
      type: "command.dispatched",
      commandId: item.commandId,
      detail: "Dispatched to the internal backbone.",
      tick: lifecycle[2].tick,
    });
    events.push({
      id: `evt_${item.dispatchId}_settled`,
      type: EVENT_BY_TERMINAL[item.terminalState],
      commandId: item.commandId,
      detail: `Settled as ${item.terminalState}.`,
      tick,
    });

    queue.push({
      dispatchId: item.dispatchId,
      commandId: item.commandId,
      commandType: item.commandType,
      commandLabel: item.commandLabel,
      title: item.title,
      agentId: item.agentId,
      agentName: item.agentName,
      priority: item.priority,
      queuePosition: item.queuePosition,
      state: item.terminalState,
      lifecycle,
      queuedAt,
      dispatchedAt,
      settledAt: terminalAt,
      estimatedDuration: item.estimatedDuration,
      traceability: item.traceability,
    });

    tick += 1;
  }

  return { queue, events, endTick: tick };
}
