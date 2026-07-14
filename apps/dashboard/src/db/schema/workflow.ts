/* Workflows — owned by a company. Parent of tasks and executions. */
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
import { relations } from "drizzle-orm";
import { tenantColumns } from "./_base";
import {
  actorTypeEnum,
  workflowExecutionStrategyEnum,
  workflowHealthEnum,
  workflowLifecycleStatusEnum,
} from "./_enums";
import { missions } from "./mission";
import { goals } from "./goal";
import { plans } from "./plan";
import { tasks } from "./task";
import { executions } from "./execution";

export const workflows = pgTable(
  "workflows",
  {
    ...tenantColumns,
    name: text("name").notNull(),
    description: text("description"),

    missionId: uuid("mission_id").references(() => missions.id),
    missionVersion: integer("mission_version"),
    goalId: uuid("goal_id").references(() => goals.id),
    goalVersion: integer("goal_version"),
    planId: uuid("plan_id").references(() => plans.id),
    planVersion: integer("plan_version"),

    workflowLifecycleStatus: workflowLifecycleStatusEnum(
      "workflow_lifecycle_status",
    ),
    workflowHealth: workflowHealthEnum("workflow_health"),
    workflowExecutionStrategy: workflowExecutionStrategyEnum(
      "workflow_execution_strategy",
    ),

    ownerActorType: actorTypeEnum("owner_actor_type"),
    ownerActorId: uuid("owner_actor_id"),

    releasedAt: timestamp("released_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),

    executionGraph: jsonb("execution_graph"),
    orchestrationMetadata: jsonb("orchestration_metadata"),
    rollbackStrategy: jsonb("rollback_strategy"),
    compensationStrategy: jsonb("compensation_strategy"),

    workflowVersion: integer("workflow_version"),
    supersedesWorkflowId: uuid("supersedes_workflow_id").references(
      (): AnyPgColumn => workflows.id,
    ),
  },
  (t) => [
    index("workflows_tenant_plan_idx").on(t.tenantId, t.planId),
    index("workflows_lifecycle_health_idx").on(
      t.workflowLifecycleStatus,
      t.workflowHealth,
    ),
    index("workflows_owner_actor_idx").on(t.ownerActorType, t.ownerActorId),
    index("workflows_supersedes_idx").on(t.supersedesWorkflowId),
  ],
);

export const workflowsRelations = relations(workflows, ({ many }) => ({
  tasks: many(tasks),
  executions: many(executions),
}));
