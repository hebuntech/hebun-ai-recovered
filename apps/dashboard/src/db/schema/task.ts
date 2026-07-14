/* Tasks — existing runtime tasks, extended additively with S6 governed lineage. */
import {
  integer,
  jsonb,
  pgTable,
  text,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { tenantColumns } from "./_base";
import {
  actorTypeEnum,
  taskExecutionTypeEnum,
  taskHealthEnum,
  taskLifecycleStatusEnum,
  taskPriorityEnum,
  taskRiskLevelEnum,
  taskStatusEnum,
} from "./_enums";
import { workflows } from "./workflow";
import { plans } from "./plan";
import { goals } from "./goal";
import { missions } from "./mission";
import { agents } from "./agent";
import { users } from "./user";

export const tasks = pgTable("tasks", {
  ...tenantColumns,
  workflowId: uuid("workflow_id").references(() => workflows.id),
  title: text("title").notNull(),
  status: taskStatusEnum("status").notNull().default("pending"),

  /* ── S6 additive strategic lineage + governed task anatomy ── */
  planId: uuid("plan_id").references(() => plans.id),
  planVersion: integer("plan_version"),
  workPackageRef: text("work_package_ref"),

  goalId: uuid("goal_id").references(() => goals.id),
  goalVersion: integer("goal_version"),

  missionId: uuid("mission_id").references(() => missions.id),
  missionVersion: integer("mission_version"),

  parentTaskId: uuid("parent_task_id").references(
    (): AnyPgColumn => tasks.id,
  ),

  ownerActorType: actorTypeEnum("owner_actor_type"),
  ownerActorId: uuid("owner_actor_id"),

  assignedAgentId: uuid("assigned_agent_id").references(() => agents.id),
  assignedHumanId: uuid("assigned_human_id").references(() => users.id),

  taskLifecycleStatus: taskLifecycleStatusEnum("task_lifecycle_status"),
  taskHealth: taskHealthEnum("task_health"),
  taskExecutionType: taskExecutionTypeEnum("task_execution_type"),
  taskPriority: taskPriorityEnum("task_priority"),
  taskRiskLevel: taskRiskLevelEnum("task_risk_level"),

  estimatedDuration: text("estimated_duration"),
  dependencies: jsonb("dependencies"),
  requiredCapabilities: jsonb("required_capabilities"),
  requiredResources: jsonb("required_resources"),
  requiredInputs: jsonb("required_inputs"),
  expectedOutputs: jsonb("expected_outputs"),
  acceptanceCriteria: jsonb("acceptance_criteria"),
  retryPolicy: jsonb("retry_policy"),
  timeoutPolicy: jsonb("timeout_policy"),
  approvalRequirement: jsonb("approval_requirement"),
  executionConstraints: jsonb("execution_constraints"),

  supersedesTaskId: uuid("supersedes_task_id").references(
    (): AnyPgColumn => tasks.id,
  ),
  taskVersion: integer("task_version"),
});
