/*
 * Policies — the organizational rule system (Spec 50).
 *
 * S4 extends this table ADDITIVELY with the canonical governed anatomy. The
 * legacy `status` text column is KEPT (dual-column window) — `policyLifecycleStatus`
 * is the governed successor; no destructive change, no backfill. Every new column
 * is nullable. Actor references use the canonical polymorphic (actorType, actorId)
 * pair from S2 (no FK to users/agents). `supersedesPolicyId` is a self-referential
 * lineage pointer (Spec 50 §3.6).
 *
 * Schema only — NO policy evaluation, NO enforcement, NO runtime. Ratification is
 * a Governance decision (governance.ts); Execution enforces effects. Policy here
 * only DEFINES rules.
 */

import {
  pgTable,
  jsonb,
  text,
  timestamp,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { tenantColumns } from "./_base";
import {
  actorTypeEnum,
  policyAuthorityEnum,
  policyDomainEnum,
  policyHealthEnum,
  policyLifecycleStatusEnum,
  policyScopeEnum,
  ruleTypeEnum,
} from "./_enums";

export const policies = pgTable("policies", {
  ...tenantColumns,

  /* ── legacy (kept; dual-column window) ── */
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("draft"),

  /* ── canonical governed anatomy (S4, all nullable/additive) ── */
  /** Governed successor to `status`. */
  policyLifecycleStatus: policyLifecycleStatusEnum("policy_lifecycle_status"),
  policyHealth: policyHealthEnum("policy_health"),
  policyDomain: policyDomainEnum("policy_domain"),
  ruleType: ruleTypeEnum("rule_type"),
  policyScope: policyScopeEnum("policy_scope"),
  policyAuthority: policyAuthorityEnum("policy_authority"),

  /** The canonical rule statement (Spec 50 §3.1). */
  statement: text("statement"),
  conditions: jsonb("conditions"),
  constraints: jsonb("constraints"),
  enforcementContract: jsonb("enforcement_contract"),
  references: jsonb("references"),

  /* Owner + steward (canonical actor pairs; no FK). */
  ownerActorType: actorTypeEnum("owner_actor_type"),
  ownerActorId: uuid("owner_actor_id"),
  stewardActorType: actorTypeEnum("steward_actor_type"),
  stewardActorId: uuid("steward_actor_id"),

  effectiveAt: timestamp("effective_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  reviewCadence: text("review_cadence"),
  rationale: text("rationale"),

  /** Lineage — the prior ratified version this supersedes (self-ref). */
  supersedesPolicyId: uuid("supersedes_policy_id").references(
    (): AnyPgColumn => policies.id,
  ),
});
