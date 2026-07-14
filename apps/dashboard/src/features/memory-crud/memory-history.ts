/*
 * Memory CRUD — mutation history.
 */

import { createEntryStore } from "@/features/crud-core/entry-store";
import type { MemoryHistoryEntry } from "./types";

const store = createEntryStore<MemoryHistoryEntry>();

export function recordHistory(entry: MemoryHistoryEntry): void {
  store.record(entry);
}

export function getHistory(): MemoryHistoryEntry[] {
  return store.list();
}

export function getHistoryCount(): number {
  return store.count();
}
