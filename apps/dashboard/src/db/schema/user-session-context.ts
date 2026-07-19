/* Server-side application session context. Provider credentials and raw session
 * identifiers are intentionally absent; only a one-way reference digest exists. */
import { sql } from "drizzle-orm";
import {
  boolean,
  char,
  check,
  foreignKey,
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { rootColumns } from "./_base";
import { authIdentities } from "./auth-identity";
import { companies } from "./company";
import { memberships } from "./membership";
import { users } from "./user";

export const userSessionContexts = pgTable(
  "user_session_contexts",
  {
    ...rootColumns,
    authIdentityId: uuid("auth_identity_id")
      .notNull()
      .references(() => authIdentities.id, { onDelete: "restrict" }),
    providerSessionReferenceHash: char("provider_session_reference_hash", {
      length: 64,
    }).notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    activeTenantId: uuid("active_tenant_id").references(() => companies.id, {
      onDelete: "restrict",
    }),
    activeMembershipId: uuid("active_membership_id"),
    membershipVersion: integer("membership_version"),
    sessionVersion: integer("session_version").notNull().default(1),
    assuranceLevel: varchar("assurance_level", { length: 16 }).notNull(),
    mfaVerified: boolean("mfa_verified").notNull().default(false),
    authenticatedAt: timestamp("authenticated_at", { withTimezone: true }).notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true }).notNull(),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).notNull(),
    absoluteExpiresAt: timestamp("absolute_expires_at", { withTimezone: true }).notNull(),
    inactivityExpiresAt: timestamp("inactivity_expires_at", {
      withTimezone: true,
    }).notNull(),
    recentAuthAt: timestamp("recent_auth_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    revocationReason: varchar("revocation_reason", { length: 64 }),
  },
  (t) => [
    uniqueIndex("user_session_contexts_provider_session_hash_uq").on(
      t.providerSessionReferenceHash,
    ),
    index("user_session_contexts_user_active_idx")
      .on(t.userId)
      .where(sql`${t.revokedAt} is null`),
    index("user_session_contexts_tenant_active_idx")
      .on(t.activeTenantId)
      .where(sql`${t.revokedAt} is null`),
    index("user_session_contexts_inactivity_expiry_idx").on(t.inactivityExpiresAt),
    index("user_session_contexts_absolute_expiry_idx").on(t.absoluteExpiresAt),
    index("user_session_contexts_revoked_retention_idx").on(t.revokedAt),
    foreignKey({
      name: "user_session_contexts_tenant_membership_fk",
      columns: [t.activeTenantId, t.activeMembershipId],
      foreignColumns: [memberships.tenantId, memberships.id],
    }).onDelete("restrict"),
    check(
      "user_session_contexts_reference_hash_chk",
      sql`${t.providerSessionReferenceHash} ~ '^[0-9a-f]{64}$'`,
    ),
    check(
      "user_session_contexts_assurance_level_chk",
      sql`${t.assuranceLevel} in ('aal1', 'aal2', 'aal3')`,
    ),
    check(
      "user_session_contexts_mfa_chk",
      sql`${t.mfaVerified} = false or ${t.assuranceLevel} in ('aal2', 'aal3')`,
    ),
    check(
      "user_session_contexts_tenant_membership_chk",
      sql`(${t.activeTenantId} is null) = (${t.activeMembershipId} is null)`,
    ),
    check(
      "user_session_contexts_membership_version_chk",
      sql`(${t.activeMembershipId} is null and ${t.membershipVersion} is null) or (${t.activeMembershipId} is not null and ${t.membershipVersion} is not null and ${t.membershipVersion} > 0)`,
    ),
    check("user_session_contexts_session_version_chk", sql`${t.sessionVersion} > 0`),
    check(
      "user_session_contexts_time_order_chk",
      sql`${t.authenticatedAt} <= ${t.issuedAt} and ${t.issuedAt} <= ${t.lastActivityAt} and ${t.inactivityExpiresAt} <= ${t.absoluteExpiresAt}`,
    ),
    check(
      "user_session_contexts_recent_auth_chk",
      sql`${t.recentAuthAt} is null or (${t.recentAuthAt} >= ${t.authenticatedAt} and ${t.recentAuthAt} <= ${t.absoluteExpiresAt})`,
    ),
    check(
      "user_session_contexts_revocation_chk",
      sql`(${t.revokedAt} is null) = (${t.revocationReason} is null)`,
    ),
    check(
      "user_session_contexts_active_lifecycle_chk",
      sql`${t.revokedAt} is not null or ${t.lifecycleStatus} = 'active'`,
    ),
  ],
);
