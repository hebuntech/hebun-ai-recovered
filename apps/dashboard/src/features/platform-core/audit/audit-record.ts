/*
 * platform-core / audit — pure builder for AuditRecord.
 *
 * Side-effect-free. Does NOT persist. A future audit sink (stage S3) will accept
 * these records and write them append-only, transactional with the mutation.
 */

import type { ActorReference } from "../actor";
import type { AuditRecord, AuditResult } from "./types";

/** Build a canonical audit record. The caller supplies the id and timestamp so
 *  this stays deterministic and free of ambient clocks / id generators. */
export function makeAuditRecord(input: {
  auditId: string;
  timestamp: string;
  actorRef: ActorReference;
  action: string;
  entityType: string;
  entityId: string;
  result: AuditResult;
  simulation: boolean;
  tenantId?: string;
  correlationId?: string;
  causationId?: string;
  previousState?: unknown;
  nextState?: unknown;
  metadata?: Record<string, unknown>;
  source?: string;
}): AuditRecord {
  return {
    auditId: input.auditId,
    tenantId: input.tenantId,
    actorRef: input.actorRef,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    correlationId: input.correlationId,
    causationId: input.causationId,
    timestamp: input.timestamp,
    previousState: input.previousState,
    nextState: input.nextState,
    metadata: input.metadata,
    result: input.result,
    simulation: input.simulation,
    source: input.source,
  };
}
