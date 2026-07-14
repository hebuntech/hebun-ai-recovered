/*
 * Live Dispatch — events.
 *
 * Emits deterministic `command.rejected` events for candidates refused entry to
 * the queue. Accepted-command events are produced by the runner; this module
 * only covers the rejected tail, tick-stamped after the live queue so the whole
 * event stream stays ordered and stable.
 */

import type { DispatchEvent, RejectedDispatch } from "./types";

export function buildDispatchEvents(
  rejected: RejectedDispatch[],
  startTick: number
): DispatchEvent[] {
  return rejected.map((item, index) => ({
    id: `evt_${item.agentId}_${item.commandId}_rejected`,
    type: "command.rejected",
    commandId: item.commandId,
    detail: `Rejected (${item.reason}): ${item.detail}`,
    tick: startTick + index,
  }));
}
