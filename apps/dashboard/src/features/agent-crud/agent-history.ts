/*
 * Agent CRUD — mutation history.
 */

import { createEntryStore } from "@/features/crud-core/entry-store";
import type { AgentHistoryEntry } from "./types";

const store = createEntryStore<AgentHistoryEntry>();

export function recordHistory(entry: AgentHistoryEntry): void {
  store.record(entry);
}

export function getHistory(): AgentHistoryEntry[] {
  return store.list();
}

export function getHistoryCount(): number {
  return store.count();
}
