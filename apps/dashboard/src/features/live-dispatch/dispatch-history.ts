/*
 * Live Dispatch — history.
 *
 * Derives an ordered, deterministic history of the dispatch run from the queue
 * lifecycle. Pure projection: no stored state, no wall clock — recomputing over
 * the same queue yields byte-identical history every time.
 */

import type { DispatchHistoryEntry, DispatchQueueItem } from "./types";

export function buildDispatchHistory(
  queue: DispatchQueueItem[],
  admitted: boolean,
  admissionReason: string
): DispatchHistoryEntry[] {
  const history: DispatchHistoryEntry[] = [
    {
      id: "hist_admit",
      stage: "admit",
      detail: admitted
        ? `Admission passed — ${admissionReason}.`
        : `Admission held — ${admissionReason}.`,
      tick: 0,
    },
  ];

  for (const item of queue) {
    const queued = item.lifecycle.find((l) => l.state === "queued");
    const dispatched = item.lifecycle.find((l) => l.state === "dispatched");
    const settled = item.lifecycle[item.lifecycle.length - 1];

    history.push({
      id: `hist_${item.dispatchId}_queue`,
      stage: "queue",
      detail: `#${item.queuePosition} ${item.commandLabel} queued (${item.dispatchId}).`,
      tick: queued?.tick ?? 0,
    });
    history.push({
      id: `hist_${item.dispatchId}_dispatch`,
      stage: "dispatch",
      detail: `#${item.queuePosition} ${item.commandLabel} dispatched internally.`,
      tick: dispatched?.tick ?? 0,
    });
    history.push({
      id: `hist_${item.dispatchId}_settle`,
      stage: "settle",
      detail: `#${item.queuePosition} ${item.commandLabel} → ${settled.state}.`,
      tick: settled.tick,
    });
  }

  return history;
}
