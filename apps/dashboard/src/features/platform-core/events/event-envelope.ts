/*
 * platform-core / events — pure builder for EventEnvelope.
 *
 * Side-effect-free. Does NOT publish, subscribe, or persist. No bus exists yet.
 * State-with-events vs event-sourcing is intentionally unresolved at this phase.
 */

import type { ActorReference } from "../actor";
import type { EventEnvelope } from "./types";

/** Build a canonical event envelope. Id/timestamp supplied by the caller to keep
 *  this deterministic and free of ambient clocks / id generators. */
export function makeEventEnvelope<TPayload>(input: {
  eventId: string;
  eventType: string;
  eventVersion: number;
  aggregateType: string;
  aggregateId: string;
  actorRef: ActorReference;
  timestamp: string;
  payload: TPayload;
  simulation: boolean;
  tenantId?: string;
  correlationId?: string;
  causationId?: string;
  metadata?: Record<string, unknown>;
  source?: string;
}): EventEnvelope<TPayload> {
  return {
    eventId: input.eventId,
    eventType: input.eventType,
    eventVersion: input.eventVersion,
    tenantId: input.tenantId,
    aggregateType: input.aggregateType,
    aggregateId: input.aggregateId,
    actorRef: input.actorRef,
    correlationId: input.correlationId,
    causationId: input.causationId,
    timestamp: input.timestamp,
    payload: input.payload,
    metadata: input.metadata,
    source: input.source,
    simulation: input.simulation,
  };
}
