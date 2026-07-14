/* Knowledge CRUD — audit log (nodes + relationships). */
import { createEntryStore } from "@/features/crud-core/entry-store";
import type { KnowledgeAuditEntry } from "./types";

const store = createEntryStore<KnowledgeAuditEntry>();

export function recordAudit(entry: KnowledgeAuditEntry): void {
  store.record(entry);
}
export function getAuditLog(): KnowledgeAuditEntry[] {
  return store.list();
}
export function getAuditCount(): number {
  return store.count();
}
