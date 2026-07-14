/* Roles — defined per tenant.
 *
 * S5 adds ADDITIVE authority metadata (all nullable/defaulted). `type`
 * (roleTypeEnum) is UNCHANGED — it remains the authority band. `authorityRank`
 * is optional ordinal metadata for ceiling computation (done later by the
 * resolver — NOT here). `systemRole` marks immutable built-in roles. `policyRefs`
 * links roles to policies (Spec 50) as data, not enforcement. Lifecycle/version
 * come from tenantColumns. */
import { pgTable, boolean, integer, jsonb, text } from "drizzle-orm/pg-core";
import { tenantColumns } from "./_base";
import { roleTypeEnum } from "./_enums";

export const roles = pgTable("roles", {
  ...tenantColumns,
  name: text("name").notNull(),
  type: roleTypeEnum("type").notNull().default("member"),

  /* ── S5 additive authority metadata ── */
  /** Optional ordinal for ceiling computation (resolver reads it later). */
  authorityRank: integer("authority_rank"),
  /** Immutable built-in role marker (e.g. platform owner/auditor). */
  systemRole: boolean("system_role").notNull().default(false),
  /** Policy references bound to this role (Spec 50) — data, not enforcement. */
  policyRefs: jsonb("policy_refs"),
});
