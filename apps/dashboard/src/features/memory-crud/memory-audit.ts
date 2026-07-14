/*
 * Memory CRUD — audit log.
 */

import { createEntryStore } from "@/features/crud-core/entry-store";
import type { MemoryAuditEntry } from "./types";

const store = createEntryStore<MemoryAuditEntry>();

export function recordAudit(entry: MemoryAuditEntry): void {
  store.record(entry);
}

export function getAuditLog(): MemoryAuditEntry[] {
  return store.list();
}

export function getAuditCount(): number {
  return store.count();
}
