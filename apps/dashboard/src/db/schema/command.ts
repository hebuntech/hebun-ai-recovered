/* Commands — the write backbone. Every mutation records one command.
 * Partition target (by created_at) at implementation time. */
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
  approvalStateEnum,
  commandExecutionTypeEnum,
  commandHealthEnum,
  commandLifecycleStatusEnum,
  commandPriorityEnum,
  commandSourceEnum,
  commandStatusEnum,
  commandTargetTypeEnum,
  providerStatusEnum,
} from "./_enums";
import { commandAudit } from "./command-audit";
import { telemetryEvents } from "./telemetry";
import { missions } from "./mission";
import { goals } from "./goal";
import { plans } from "./plan";
import { tasks } from "./task";
import { workflows } from "./workflow";

export const commands = pgTable(
  "commands",
  {
    ...tenantColumns,
    traceId: text("trace_id").notNull(),
    commandType: text("command_type").notNull(),
    source: commandSourceEnum("source").notNull().default("ui"),
    actor: text("actor").notNull(),
    status: commandStatusEnum("status").notNull().default("queued"),
    approvalState: approvalStateEnum("approval_state")
      .notNull()
      .default("not-required"),
    context: jsonb("context"),
    payload: jsonb("payload"),
    lifecycle: jsonb("lifecycle"),
    dispatchedAt: timestamp("dispatched_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    missionId: uuid("mission_id").references(() => missions.id),
    missionVersion: integer("mission_version"),
    goalId: uuid("goal_id").references(() => goals.id),
    goalVersion: integer("goal_version"),
    planId: uuid("plan_id").references(() => plans.id),
    planVersion: integer("plan_version"),
    taskId: uuid("task_id").references(() => tasks.id),
    taskVersion: integer("task_version"),
    workflowId: uuid("workflow_id").references(() => workflows.id),
    workflowVersion: integer("workflow_version"),
    workflowNodeId: text("workflow_node_id"),

    commandLifecycleStatus: commandLifecycleStatusEnum(
      "command_lifecycle_status",
    ),
    commandHealth: commandHealthEnum("command_health"),
    commandTargetType: commandTargetTypeEnum("command_target_type"),
    commandExecutionType: commandExecutionTypeEnum("command_execution_type"),
    commandPriority: commandPriorityEnum("command_priority"),

    correlationId: text("correlation_id"),
    causationId: text("causation_id"),
    idempotencyKey: text("idempotency_key"),
    simulationMode: providerStatusEnum("simulation_mode"),

    providerConstraints: jsonb("provider_constraints"),
    executionContext: jsonb("execution_context"),
    expectedResult: jsonb("expected_result"),

    commandVersion: integer("command_version"),
    supersedesCommandId: uuid("supersedes_command_id").references(
      (): AnyPgColumn => commands.id,
    ),
  },
  (t) => [
    index("commands_workflow_idx").on(t.workflowId, t.workflowNodeId),
    index("commands_task_idx").on(t.taskId),
    index("commands_correlation_idx").on(t.correlationId),
    index("commands_idempotency_idx").on(t.tenantId, t.idempotencyKey),
    index("commands_lifecycle_health_idx").on(
      t.commandLifecycleStatus,
      t.commandHealth,
    ),
    index("commands_supersedes_idx").on(t.supersedesCommandId),
  ],
);

export const commandsRelations = relations(commands, ({ many }) => ({
  audit: many(commandAudit),
  telemetry: many(telemetryEvents),
}));
