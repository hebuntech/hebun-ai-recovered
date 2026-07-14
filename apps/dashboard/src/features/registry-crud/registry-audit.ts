/*
 * Registry CRUD — audit log.
 *
 * Every mutation records who did what, the command that carried it, and the
 * before/after lifecycle state. In-memory, newest first.
 */

import { createEntryStore } from "@/features/crud-core/entry-store";
import type { RegistryAuditEntry } from "./types";

const store = createEntryStore<RegistryAuditEntry>();

export function recordAudit(entry: RegistryAuditEntry): void {
  store.record(entry);
}

export function getAuditLog(): RegistryAuditEntry[] {
  return store.list();
}

export function getAuditCount(): number {
  return store.count();
}
