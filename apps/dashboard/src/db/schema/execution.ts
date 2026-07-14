/* Executions — runs of a workflow / task. */
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
  executionHealthEnum,
  executionLifecycleStatusEnum,
  executionStatusEnum,
  providerStatusEnum,
} from "./_enums";
import { commands } from "./command";
import { workflows } from "./workflow";
import { tasks } from "./task";
import { plans } from "./plan";
import { goals } from "./goal";
import { missions } from "./mission";

export const executions = pgTable(
  "executions",
  {
    ...tenantColumns,
    workflowId: uuid("workflow_id").references(() => workflows.id),
    status: executionStatusEnum("status").notNull().default("pending"),
    retries: integer("retries").notNull().default(0),
    duration: text("duration"),

    commandId: uuid("command_id").references(() => commands.id),
    taskId: uuid("task_id").references(() => tasks.id),
    planId: uuid("plan_id").references(() => plans.id),
    goalId: uuid("goal_id").references(() => goals.id),
    missionId: uuid("mission_id").references(() => missions.id),

    executionLifecycleStatus: executionLifecycleStatusEnum(
      "execution_lifecycle_status",
    ),
    executionHealth: executionHealthEnum("execution_health"),

    attemptNumber: integer("attempt_number"),
    effectLedgerId: uuid("effect_ledger_id"),
    executionContextSnapshot: jsonb("execution_context_snapshot"),
    providerResolution: jsonb("provider_resolution"),
    resolvedTarget: jsonb("resolved_target"),
    executionMetrics: jsonb("execution_metrics"),
    simulationMode: providerStatusEnum("simulation_mode"),

    startedAt: timestamp("started_at", { withTimezone: true }),
    validatedAt: timestamp("validated_at", { withTimezone: true }),
    committedAt: timestamp("committed_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),

    executionVersion: integer("execution_version"),
    supersedesExecutionId: uuid("supersedes_execution_id").references(
      (): AnyPgColumn => executions.id,
    ),
  },
  (t) => [
    index("executions_command_idx").on(t.commandId),
    index("executions_workflow_idx").on(t.workflowId),
    index("executions_lifecycle_health_idx").on(
      t.executionLifecycleStatus,
      t.executionHealth,
    ),
    index("executions_supersedes_idx").on(t.supersedesExecutionId),
  ],
);
