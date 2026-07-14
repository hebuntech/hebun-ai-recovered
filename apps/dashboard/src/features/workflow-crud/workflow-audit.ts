/*
 * Workflow CRUD — audit log.
 */

import { createEntryStore } from "@/features/crud-core/entry-store";
import type { WorkflowAuditEntry } from "./types";

const store = createEntryStore<WorkflowAuditEntry>();

export function recordAudit(entry: WorkflowAuditEntry): void {
  store.record(entry);
}

export function getAuditLog(): WorkflowAuditEntry[] {
  return store.list();
}

export function getAuditCount(): number {
  return store.count();
}
