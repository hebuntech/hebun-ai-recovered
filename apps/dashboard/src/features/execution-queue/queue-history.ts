/*
 * Execution Queue — history.
 *
 * Ordered transition history, projected from entries or from the store's global
 * transition log. Pure and deterministic — ordered by the synthetic seq that the
 * store assigns on every transition.
 */

import { getTransitions } from "./queue-store";
import type { ExecutionQueueEntry, TransitionRecord } from "./types";

/** Ordered transition history for a set of entries (ascending by seq). */
export function buildHistory(entries: ExecutionQueueEntry[]): TransitionRecord[] {
  return entries
    .flatMap((entry) => entry.history)
    .slice()
    .sort((a, b) => a.seq - b.seq);
}

/** Whole-store transition history (all agents), ascending by seq. */
export function getGlobalHistory(): TransitionRecord[] {
  return getTransitions().sort((a, b) => a.seq - b.seq);
}
