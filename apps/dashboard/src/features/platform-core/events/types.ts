/*
 * platform-core / events — canonical event envelope (Spec 48 §10.1).
 *
 * Every domain event, in every module, is expected to carry this envelope.
 * Events are transactional with their mutation and are the only cross-module
 * reaction surface.
 *
 * ── SCOPE OF THIS PHASE ────────────────────────────────────────────────────
 * Contract ONLY. There is NO event bus, NO publishing, NO subscriptions, and
 * NO event sourcing here. The existing mock events (features/events/mock.ts)
 * are untouched.
 *
 * NOTE: State-with-events vs event-sourcing is intentionally unresolved at this
 * phase. This envelope is compatible with either model — it describes the shape
 * of an emitted domain event without asserting that events are the source of
 * truth. That decision is made before the event-bus implementation (stage S3).
 */

import type { ActorReference } from "../actor";

/**
 * The canonical domain-event envelope. `payload` is domain-defined and opaque
 * to this contract.
 */
export interface EventEnvelope<TPayload = unknown> {
  readonly eventId: string;
  /** Dotted domain event name, e.g. "mission.ratified", "command.completed". */
  readonly eventType: string;
  /** Schema version of this event type, for forward/backward compatibility. */
  readonly eventVersion: number;
  readonly tenantId?: string;
  /** The aggregate (entity kind) the event is about, e.g. "mission". */
  readonly aggregateType: string;
  readonly aggregateId: string;
  /** The accountable actor (canonical actor reference). */
  readonly actorRef: ActorReference;
  /** Threads this event through its run and lineage. */
  readonly correlationId?: string;
  /** The event/action that caused this one, if any. */
  readonly causationId?: string;
  readonly timestamp: string;
  readonly payload: TPayload;
  readonly metadata?: Readonly<Record<string, unknown>>;
  /** Channel/source, mirroring commandSourceEnum values. */
  readonly source?: string;
  /** True when emitted under a non-live posture (no real effect occurred). */
  readonly simulation: boolean;
}
