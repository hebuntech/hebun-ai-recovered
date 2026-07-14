/* Knowledge CRUD — mutation history (nodes + relationships). */
import { createEntryStore } from "@/features/crud-core/entry-store";
import type { KnowledgeHistoryEntry } from "./types";

const store = createEntryStore<KnowledgeHistoryEntry>();

export function recordHistory(entry: KnowledgeHistoryEntry): void {
  store.record(entry);
}
export function getHistory(): KnowledgeHistoryEntry[] {
  return store.list();
}
export function getHistoryCount(): number {
  return store.count();
}
