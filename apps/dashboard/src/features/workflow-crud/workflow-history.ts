/*
 * Workflow CRUD — mutation history.
 */

import { createEntryStore } from "@/features/crud-core/entry-store";
import type { WorkflowHistoryEntry } from "./types";

const store = createEntryStore<WorkflowHistoryEntry>();

export function recordHistory(entry: WorkflowHistoryEntry): void {
  store.record(entry);
}

export function getHistory(): WorkflowHistoryEntry[] {
  return store.list();
}

export function getHistoryCount(): number {
  return store.count();
}
