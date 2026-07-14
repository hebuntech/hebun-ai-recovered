/*
 * Execution Queue — stateful in-memory store.
 *
 * Reuses the same reactive singleton pattern that Registry CRUD / Agent CRUD use
 * through the persistence layer: a module-level store, a listener set, and an
 * immutable snapshot swapped on every mutation to power `useSyncExternalStore`.
 *
 * This store is the reason the queue is STATEFUL: it lives for the session,
 * survives re-renders, and is only ever seeded once per agent. Recomputing a
 * page reads the existing snapshot — it never recreates the queue.
 *
 * Deterministic: the only clock is a monotonic `seq` counter (reset to 0 with
 * the store). No wall clock, no randomness, no async.
 */

import type { ExecutionQueueEntry, TransitionRecord } from "./types";

let entries: ExecutionQueueEntry[] = [];
let snapshot: ExecutionQueueEntry[] = entries;
const transitions: TransitionRecord[] = [];
const seededAgents = new Set<string>();
const listeners = new Set<() => void>();
let seq = 0;

function emit(): void {
  snapshot = entries.slice();
  listeners.forEach((listener) => listener());
}

/* -------------------------------------------------------- Reactivity ----- */

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Stable reference until the next mutation — required by useSyncExternalStore. */
export function getSnapshot(): ExecutionQueueEntry[] {
  return snapshot;
}

/* ------------------------------------------------------- Sequence -------- */

/** Monotonic synthetic sequence number. Deterministic from a clean reset. */
export function nextSeq(): number {
  seq += 1;
  return seq;
}

export function currentSeq(): number {
  return seq;
}

/* ------------------------------------------------------- Seed guard ------ */

export function isSeeded(agentId: string): boolean {
  return seededAgents.has(agentId);
}

export function markSeeded(agentId: string): void {
  seededAgents.add(agentId);
}

/* ------------------------------------------------------- Reads ----------- */

export function getEntries(): ExecutionQueueEntry[] {
  return snapshot;
}

export function getEntriesByAgent(agentId: string): ExecutionQueueEntry[] {
  return snapshot.filter((entry) => entry.agentId === agentId);
}

export function getEntry(id: string): ExecutionQueueEntry | undefined {
  return snapshot.find((entry) => entry.id === id);
}

export function getTransitions(): TransitionRecord[] {
  return transitions.slice();
}

/* ------------------------------------------------------- Mutations ------- */

/** Append seed entries. Batched: call `commit()` once when done seeding. */
export function addEntries(newEntries: ExecutionQueueEntry[]): void {
  entries = [...entries, ...newEntries];
}

/** Replace one entry in place by id (immutable). */
export function replaceEntry(updated: ExecutionQueueEntry): void {
  entries = entries.map((entry) => (entry.id === updated.id ? updated : entry));
}

export function recordTransition(record: TransitionRecord): void {
  transitions.push(record);
}

/** Publish batched mutations to subscribers. */
export function commit(): void {
  emit();
}

/** Full reset — used by determinism proofs and store teardown. */
export function resetStore(): void {
  entries = [];
  snapshot = entries;
  transitions.length = 0;
  seededAgents.clear();
  seq = 0;
  emit();
}
