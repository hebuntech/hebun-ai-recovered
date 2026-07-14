/* Memberships — many-to-many join of users to companies with a role.
 *
 * S5 adds ADDITIVE authority/lifecycle fields (all nullable). Existing userId/
 * roleId relationships and the (tenantId,userId) unique index are UNCHANGED.
 * `delegatedBy*` is the canonical actor pair (S2) — the actor who granted this
 * membership/authority; no cross-table FK. Membership version comes from
 * tenantColumns.version. */
import { pgTable, text, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";
import { tenantColumns } from "./_base";
import { actorTypeEnum } from "./_enums";
import { users } from "./user";
import { roles } from "./role";

export const memberships = pgTable(
  "memberships",
  {
    ...tenantColumns,
    userId: uuid("user_id").notNull().references(() => users.id),
    roleId: uuid("role_id").references(() => roles.id),

    /* ── S5 additive authority/lifecycle ── */
    effectiveFrom: timestamp("effective_from", { withTimezone: true }),
    effectiveUntil: timestamp("effective_until", { withTimezone: true }),
    /** Actor who granted/delegated this membership (canonical pair; no FK). */
    delegatedByType: actorTypeEnum("delegated_by_type"),
    delegatedById: uuid("delegated_by_id"),
    suspendedAt: timestamp("suspended_at", { withTimezone: true }),
    /** Optional narrowing of authority within the tenant (e.g. a scope key). */
    authorityScope: text("authority_scope"),
  },
  (t) => [uniqueIndex("memberships_tenant_user_uq").on(t.tenantId, t.userId)]
);
