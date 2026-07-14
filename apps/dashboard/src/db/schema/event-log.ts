/*
 * event_log — the shared, immutable domain-event record (Spec 48 §10.1).
 *
 * "What happened, in which aggregate, and what may other components react to?"
 * Maps 1:1 to the canonical platform-core EventEnvelope contract.
 *
 * STATE-WITH-EVENTS (not event sourcing): domain state stays authoritative;
 * events are immutable facts emitted alongside state changes. Events do NOT
 * rebuild state in this phase.
 *
 * APPEND-ONLY / IMMUTABLE by design (no soft-delete/update; not tenantColumns).
 * Deliberately NO subscriber state, retry queue, delivery status, projection, or
 * event-sourcing fields — publishing and subscriptions are deferred.
 *
 * Actor is the canonical polymorphic (actorType, actorId) pair from S2 — no FK.
 *
 * INACTIVE this phase: no bus, no publishing, no subscriptions. The existing
 * mock events (features/events/mock.ts) stay untouched.
 */

import {
  pgTable,
  boolean,
  index,
  integer,
  jsonb,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { actorTypeEnum } from "./_enums";
import { companies } from "./company";

export const eventLog = pgTable(
  "event_log",
  {
    /** eventId */
    id: uuid("id").primaryKey().defaultRandom(),

    eventType: text("event_type").notNull(),
    eventVersion: integer("event_version").notNull().default(1),

    tenantId: uuid("tenant_id").references(() => companies.id),

    aggregateType: text("aggregate_type").notNull(),
    aggregateId: uuid("aggregate_id").notNull(),

    /* Canonical actor reference (polymorphic pair; no FK). */
    actorType: actorTypeEnum("actor_type").notNull(),
    actorId: uuid("actor_id").notNull(),

    correlationId: text("correlation_id"),
    causationId: text("causation_id"),

    /** Logical time from the EventEnvelope contract. */
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    /** DB insertion time (observability; distinct from occurredAt). */
    recordedAt: timestamp("recorded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    payload: jsonb("payload").notNull(),
    metadata: jsonb("metadata"),
    source: text("source"),

    /** True when emitted under a non-live posture (no real effect occurred). */
    simulation: boolean("simulation").notNull().default(false),
  },
  (t) => [
    index("event_log_tenant_time_idx").on(t.tenantId, t.occurredAt),
    index("event_log_aggregate_idx").on(t.aggregateType, t.aggregateId),
    index("event_log_type_time_idx").on(t.eventType, t.occurredAt),
    index("event_log_correlation_idx").on(t.correlationId),
  ],
);
