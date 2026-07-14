/*
 * Goals — measurable, mission-derived outcomes (Spec 36).
 *
 * Schema only: owned, versioned, lineage-aware; no health calculation, no
 * progress roll-up, no Mission alignment runtime.
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
  goalHealthEnum,
  goalLifecycleStatusEnum,
  goalPriorityEnum,
  goalScopeEnum,
} from "./_enums";
import { missions } from "./mission";

export const goals = pgTable(
  "goals",
  {
    ...tenantColumns,

    missionId: uuid("mission_id")
      .notNull()
      .references(() => missions.id),
    missionVersion: integer("mission_version").notNull().default(1),

    parentGoalId: uuid("parent_goal_id").references(
      (): AnyPgColumn => goals.id,
    ),

    ownerActorType: actorTypeEnum("owner_actor_type"),
    ownerActorId: uuid("owner_actor_id"),

    title: text("title").notNull(),
    description: text("description"),
    goalScope: goalScopeEnum("goal_scope").notNull(),
    goalPriority: goalPriorityEnum("goal_priority").notNull(),
    goalLifecycleStatus: goalLifecycleStatusEnum("goal_lifecycle_status")
      .notNull()
      .default("draft"),
    goalHealth: goalHealthEnum("goal_health").notNull().default("unknown"),

    successCriteria: jsonb("success_criteria"),
    successMetrics: jsonb("success_metrics"),
    targetValues: jsonb("target_values"),
    currentProgress: jsonb("current_progress"),
    dependencies: jsonb("dependencies"),
    risks: jsonb("risks"),
    assumptions: jsonb("assumptions"),

    confidence: integer("confidence"),
    reviewCadence: text("review_cadence"),
    nextReviewAt: timestamp("next_review_at", { withTimezone: true }),

    supersedesGoalId: uuid("supersedes_goal_id").references(
      (): AnyPgColumn => goals.id,
    ),
    goalVersion: integer("goal_version").notNull().default(1),
  },
  (t) => [
    index("goals_tenant_mission_idx").on(t.tenantId, t.missionId),
    index("goals_parent_goal_idx").on(t.parentGoalId),
    index("goals_owner_actor_idx").on(t.ownerActorType, t.ownerActorId),
    index("goals_lifecycle_health_idx").on(
      t.goalLifecycleStatus,
      t.goalHealth,
    ),
    index("goals_next_review_at_idx").on(t.nextReviewAt),
    index("goals_supersedes_idx").on(t.supersedesGoalId),
  ],
);
