/*
 * platform-core / audit — pure mapping: canonical AuditRecord → schema-safe
 * insert shape for the `audit_log` table (src/db/schema/audit-log.ts).
 *
 * Pure function. No database client, no writes, no runtime bus. Structurally
 * typed (no drizzle table import) to keep platform-core decoupled from the
 * schema module. The key names match the drizzle column property names.
 */

import type { AuditRecord } from "./types";

/** Structural shape accepted by an `audit_log` insert (keys = drizzle props). */
export interface AuditLogInsert {
  id?: string;
  tenantId?: string;
  actorType: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  correlationId?: string;
  causationId?: string;
  occurredAt: Date;
  previousState?: unknown;
  nextState?: unknown;
  metadata?: Record<string, unknown>;
  result: string;
  simulation: boolean;
  source?: string;
}

/** Convert a canonical AuditRecord into an insert-ready row. Pure. */
export function toAuditLogInsert(record: AuditRecord): AuditLogInsert {
  return {
    id: record.auditId,
    tenantId: record.tenantId ?? record.actorRef.tenantId,
    actorType: record.actorRef.actorType,
    actorId: record.actorRef.actorId,
    action: record.action,
    entityType: record.entityType,
    entityId: record.entityId,
    correlationId: record.correlationId,
    causationId: record.causationId,
    occurredAt: new Date(record.timestamp),
    previousState: record.previousState,
    nextState: record.nextState,
    metadata: record.metadata as Record<string, unknown> | undefined,
    result: record.result,
    simulation: record.simulation,
    source: record.source,
  };
}
