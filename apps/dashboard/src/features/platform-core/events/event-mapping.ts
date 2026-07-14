/*
 * platform-core / events — pure mapping: canonical EventEnvelope → schema-safe
 * insert shape for the `event_log` table (src/db/schema/event-log.ts).
 *
 * Pure function. No database client, no publishing, no subscriptions, no bus.
 * Structurally typed (no drizzle import). Keys match the drizzle column props.
 * State-with-events: this maps an emitted event to its immutable record; it does
 * NOT rebuild state.
 */

import type { EventEnvelope } from "./types";

/** Structural shape accepted by an `event_log` insert (keys = drizzle props). */
export interface EventLogInsert {
  id?: string;
  eventType: string;
  eventVersion: number;
  tenantId?: string;
  aggregateType: string;
  aggregateId: string;
  actorType: string;
  actorId: string;
  correlationId?: string;
  causationId?: string;
  occurredAt: Date;
  payload: unknown;
  metadata?: Record<string, unknown>;
  source?: string;
  simulation: boolean;
}

/** Convert a canonical EventEnvelope into an insert-ready row. Pure. */
export function toEventLogInsert<TPayload>(
  envelope: EventEnvelope<TPayload>,
): EventLogInsert {
  return {
    id: envelope.eventId,
    eventType: envelope.eventType,
    eventVersion: envelope.eventVersion,
    tenantId: envelope.tenantId ?? envelope.actorRef.tenantId,
    aggregateType: envelope.aggregateType,
    aggregateId: envelope.aggregateId,
    actorType: envelope.actorRef.actorType,
    actorId: envelope.actorRef.actorId,
    correlationId: envelope.correlationId,
    causationId: envelope.causationId,
    occurredAt: new Date(envelope.timestamp),
    payload: envelope.payload,
    metadata: envelope.metadata as Record<string, unknown> | undefined,
    source: envelope.source,
    simulation: envelope.simulation,
  };
}
