/*
 * Agent CRUD — audit log.
 */

import { createEntryStore } from "@/features/crud-core/entry-store";
import type { AgentAuditEntry } from "./types";

const store = createEntryStore<AgentAuditEntry>();

export function recordAudit(entry: AgentAuditEntry): void {
  store.record(entry);
}

export function getAuditLog(): AgentAuditEntry[] {
  return store.list();
}

export function getAuditCount(): number {
  return store.count();
}
