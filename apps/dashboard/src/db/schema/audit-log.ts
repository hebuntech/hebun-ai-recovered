/*
 * audit_log — the shared, cross-domain, immutable audit sink (Spec 48 §7.3).
 *
 * "Who did what, to which entity, under which authority, and what changed?"
 * Maps 1:1 to the canonical platform-core AuditRecord contract.
 *
 * APPEND-ONLY / IMMUTABLE by design:
 *   - no soft-delete, no updatedBy, no version-update semantics (deliberately
 *     NOT using tenantColumns, which model mutable rows);
 *   - `recordVersion` is the record-FORMAT version, not an entity version;
 *   - immutability is enforced at the write layer (later), never by editing rows.
 *
 * Actor is the canonical polymorphic (actorType, actorId) pair from S2 — NO FK
 * to users/agents (agent/system/service actors are not users rows).
 *
 * This schema is INACTIVE in this phase: no writer, no bus, no Command Bus
 * integration. The existing command_audit table stays operational and untouched
 * (dual-model window; folding-in deferred).
 */

import {
  pgTable,
  char,
  check,
  boolean,
  index,
  integer,
  jsonb,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { actorTypeEnum, auditResultEnum } from "./_enums";
import { companies } from "./company";

export const auditLog = pgTable(
  "audit_log",
  {
    /** auditId */
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => companies.id),

    /* Canonical actor reference (polymorphic pair; no FK). */
    actorType: actorTypeEnum("actor_type").notNull(),
    actorId: uuid("actor_id").notNull(),

    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),

    correlationId: text("correlation_id"),
    causationId: text("causation_id"),

    /** Logical time from the AuditRecord contract. */
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    /** DB insertion time (observability; distinct from occurredAt). */
    recordedAt: timestamp("recorded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    previousState: jsonb("previous_state"),
    nextState: jsonb("next_state"),
    metadata: jsonb("metadata"),

    result: auditResultEnum("result").notNull(),
    /** True when produced under a non-live posture (no real effect occurred). */
    simulation: boolean("simulation").notNull().default(false),
    source: text("source"),
    requestId: varchar("request_id", { length: 128 }),
    sessionContextId: uuid("session_context_id"),
    authoritySource: varchar("authority_source", { length: 64 }),
    principalReferenceHash: char("principal_reference_hash", { length: 64 }),

    /** Record-format version (append-only; not an entity lifecycle version). */
    recordVersion: integer("record_version").notNull().default(1),
  },
  (t) => [
    index("audit_log_tenant_time_idx").on(t.tenantId, t.occurredAt),
    index("audit_log_entity_idx").on(t.entityType, t.entityId),
    index("audit_log_correlation_idx").on(t.correlationId),
    index("audit_log_actor_idx").on(t.actorType, t.actorId),
    index("audit_log_request_idx").on(t.requestId),
    index("audit_log_session_idx").on(t.sessionContextId),
    index("audit_log_principal_idx").on(t.principalReferenceHash),
    index("audit_log_tenant_action_time_idx").on(
      t.tenantId,
      t.action,
      t.occurredAt,
    ),
    check(
      "audit_log_principal_reference_hash_chk",
      sql`${t.principalReferenceHash} is null or ${t.principalReferenceHash} ~ '^[0-9a-f]{64}$'`,
    ),
    check(
      "audit_log_authority_source_chk",
      sql`${t.authoritySource} is null or ${t.authoritySource} in ('membership', 'platform-admin', 'internal-service', 'system')`,
    ),
  ],
);
