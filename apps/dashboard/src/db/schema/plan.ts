/*
 * Plans — strategy records beneath Goals and above Tasks (Spec 37).
 *
 * Schema only: no readiness engine, no Task generation runtime, no execution
 * state ownership.
 */
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { tenantColumns } from "./_base";
import {
  actorTypeEnum,
  planHealthEnum,
  planLifecycleStatusEnum,
  planPriorityEnum,
  planScopeEnum,
} from "./_enums";
import { goals } from "./goal";
import { missions } from "./mission";

export const plans = pgTable(
  "plans",
  {
    ...tenantColumns,

    missionId: uuid("mission_id")
      .notNull()
      .references(() => missions.id),
    missionVersion: integer("mission_version").notNull().default(1),

    goalId: uuid("goal_id")
      .notNull()
      .references(() => goals.id),
    goalVersion: integer("goal_version").notNull().default(1),

    parentPlanId: uuid("parent_plan_id").references(
      (): AnyPgColumn => plans.id,
    ),

    ownerActorType: actorTypeEnum("owner_actor_type"),
    ownerActorId: uuid("owner_actor_id"),

    title: text("title").notNull(),
    description: text("description"),
    planScope: planScopeEnum("plan_scope").notNull(),
    planPriority: planPriorityEnum("plan_priority").notNull(),
    planLifecycleStatus: planLifecycleStatusEnum("plan_lifecycle_status")
      .notNull()
      .default("draft"),
    planHealth: planHealthEnum("plan_health").notNull().default("unknown"),

    strategy: jsonb("strategy"),
    successCriteria: jsonb("success_criteria"),
    milestones: jsonb("milestones"),
    workPackages: jsonb("work_packages"),
    dependencies: jsonb("dependencies"),
    assumptions: jsonb("assumptions"),
    risks: jsonb("risks"),
    requiredCapabilities: jsonb("required_capabilities"),
    requiredResources: jsonb("required_resources"),
    budget: jsonb("budget"),
    estimatedDuration: text("estimated_duration"),
    reviewCadence: text("review_cadence"),
    nextReviewAt: timestamp("next_review_at", { withTimezone: true }),
    approvalGates: jsonb("approval_gates"),
    executionReadiness: jsonb("execution_readiness"),

    supersedesPlanId: uuid("supersedes_plan_id").references(
      (): AnyPgColumn => plans.id,
    ),
    planVersion: integer("plan_version").notNull().default(1),
  },
  (t) => [
    index("plans_tenant_goal_idx").on(t.tenantId, t.goalId),
    index("plans_tenant_mission_idx").on(t.tenantId, t.missionId),
    index("plans_parent_plan_idx").on(t.parentPlanId),
    index("plans_owner_actor_idx").on(t.ownerActorType, t.ownerActorId),
    index("plans_lifecycle_health_idx").on(
      t.planLifecycleStatus,
      t.planHealth,
    ),
    index("plans_next_review_at_idx").on(t.nextReviewAt),
    index("plans_supersedes_idx").on(t.supersedesPlanId),
  ],
);
