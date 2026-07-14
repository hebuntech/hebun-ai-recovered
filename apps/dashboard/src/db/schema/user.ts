/* Users — global identity (a user may belong to many tenants via memberships).
 * Uses rootColumns: not owned by a single tenant. authId maps to Supabase Auth.
 *
 * S5 adds ADDITIVE identity fields (all nullable, no backfill). authId + email
 * behavior UNCHANGED — authentication is not touched. Lifecycle/version come from
 * rootColumns; these fields are the extra Identity-domain attributes (§34).
 * A human actor resolves as (actorType="human", actorId=users.id). */
import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { rootColumns } from "./_base";

export const users = pgTable(
  "users",
  {
    ...rootColumns,
    authId: text("auth_id"),
    email: text("email").notNull(),
    name: text("name"),

    /* ── S5 additive identity attributes ── */
    displayName: text("display_name"),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    suspendedAt: timestamp("suspended_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("users_email_uq").on(t.email)]
);
