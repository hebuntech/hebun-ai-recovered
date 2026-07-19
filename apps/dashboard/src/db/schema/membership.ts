/* Memberships — many-to-many join of users to companies with a role.
 *
 * S5 adds ADDITIVE authority/lifecycle fields (all nullable). Existing userId/
 * roleId relationships and the (tenantId,userId) unique index are UNCHANGED.
 * `delegatedBy*` is the canonical actor pair (S2) — the actor who granted this
 * membership/authority; no cross-table FK. Membership version comes from
 * tenantColumns.version. */
import { sql } from "drizzle-orm";
import {
  check,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { tenantColumns } from "./_base";
import { actorTypeEnum, membershipStatusEnum } from "./_enums";
import { invitations } from "./invitation";
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
    status: membershipStatusEnum("status"),
    statusChangedAt: timestamp("status_changed_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    revokedByType: actorTypeEnum("revoked_by_type"),
    revokedById: uuid("revoked_by_id"),
    revocationReason: varchar("revocation_reason", { length: 128 }),
    acceptedInvitationId: uuid("accepted_invitation_id").references(
      () => invitations.id,
      { onDelete: "restrict" },
    ),
  },
  (t) => [
    uniqueIndex("memberships_tenant_user_uq").on(t.tenantId, t.userId),
    unique("memberships_tenant_id_id_uq").on(t.tenantId, t.id),
    unique("memberships_accepted_invitation_uq").on(t.acceptedInvitationId),
    check(
      "memberships_revocation_actor_chk",
      sql`(${t.revokedByType} is null) = (${t.revokedById} is null)`,
    ),
  ],
);
