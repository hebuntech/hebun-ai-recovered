/*
 * Registry CRUD — mutation history.
 *
 * A newest-first log of CRUD operations, linked to the command that carried each
 * one. Distinct from the Command Bus history: this is the registry-domain view.
 */

import { createEntryStore } from "@/features/crud-core/entry-store";
import type { RegistryHistoryEntry } from "./types";

const store = createEntryStore<RegistryHistoryEntry>();

export function recordHistory(entry: RegistryHistoryEntry): void {
  store.record(entry);
}

export function getHistory(): RegistryHistoryEntry[] {
  return store.list();
}

export function getHistoryCount(): number {
  return store.count();
}
