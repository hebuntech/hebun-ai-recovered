/*
 * Missions — the tenant-owned North Star of intent (Spec 35).
 *
 * Schema only: one ratified company-level mission per tenant, no ratification
 * runtime, no alignment runtime, no automatic supersession behavior.
 */
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { tenantColumns } from "./_base";
import { actorTypeEnum, missionLifecycleStatusEnum } from "./_enums";

export const missions = pgTable(
  "missions",
  {
    ...tenantColumns,

    statement: text("statement").notNull(),
    description: text("description"),
    principles: jsonb("principles"),
    constraints: jsonb("constraints"),

    ownerActorType: actorTypeEnum("owner_actor_type"),
    ownerActorId: uuid("owner_actor_id"),

    /*
     * Minimal explicit scope for the North Star invariant. Only `company` is
     * supported in S6; narrower scopes are deferred.
     */
    scope: text("scope").notNull().default("company"),
    missionLifecycleStatus: missionLifecycleStatusEnum("mission_lifecycle_status")
      .notNull()
      .default("draft"),

    ratifiedByActorType: actorTypeEnum("ratified_by_actor_type"),
    ratifiedByActorId: uuid("ratified_by_actor_id"),
    ratifiedAt: timestamp("ratified_at", { withTimezone: true }),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }),
    effectiveUntil: timestamp("effective_until", { withTimezone: true }),
    reviewAt: timestamp("review_at", { withTimezone: true }),

    supersedesMissionId: uuid("supersedes_mission_id").references(
      (): AnyPgColumn => missions.id,
    ),
    missionVersion: integer("mission_version").notNull().default(1),
  },
  (t) => [
    check("missions_scope_company_chk", sql`${t.scope} = 'company'`),
    index("missions_tenant_scope_idx").on(t.tenantId, t.scope),
    index("missions_owner_actor_idx").on(t.ownerActorType, t.ownerActorId),
    index("missions_review_at_idx").on(t.reviewAt),
    index("missions_supersedes_idx").on(t.supersedesMissionId),
    uniqueIndex("missions_single_ratified_company_uq")
      .on(t.tenantId, t.scope)
      .where(
        sql`${t.scope} = 'company' and ${t.missionLifecycleStatus} = 'ratified'`,
      ),
  ],
);
