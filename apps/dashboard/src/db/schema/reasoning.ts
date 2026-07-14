/*
 * Reasoning traces — auditable reasoning summaries, never private chain-of-thought.
 *
 * This table stores structured evidence, assumptions, conflicts, citations,
 * conclusions, verification summaries, and session metadata only. It MUST NOT
 * persist raw hidden model reasoning or unrestricted chain-of-thought tokens.
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
import { commands } from "./command";
import { agents } from "./agent";
import { workingMemories } from "./working_memory";
import { missions } from "./mission";
import { goals } from "./goal";
import { plans } from "./plan";
import { tasks } from "./task";
import { workflows } from "./workflow";
import { executions } from "./execution";
import {
  reasoningHealthEnum,
  reasoningLifecycleStatusEnum,
  reasoningStrategyEnum,
} from "./_enums";

export const reasoningTraces = pgTable(
  "reasoning_traces",
  {
    ...tenantColumns,
    commandId: uuid("command_id").references(() => commands.id),
    confidence: integer("confidence"),
    stages: jsonb("stages"),
    evidence: jsonb("evidence"),

    /* ── S11 reasoning foundation (auditable summary only; no private CoT) ── */
    agentId: uuid("agent_id").references(() => agents.id),
    workingMemoryId: uuid("working_memory_id").references(() => workingMemories.id),
    missionId: uuid("mission_id").references(() => missions.id),
    missionVersion: integer("mission_version"),
    goalId: uuid("goal_id").references(() => goals.id),
    goalVersion: integer("goal_version"),
    planId: uuid("plan_id").references(() => plans.id),
    planVersion: integer("plan_version"),
    taskId: uuid("task_id").references(() => tasks.id),
    workflowId: uuid("workflow_id").references(() => workflows.id),
    executionId: uuid("execution_id").references(() => executions.id),
    reasoningLifecycleStatus: reasoningLifecycleStatusEnum(
      "reasoning_lifecycle_status",
    ),
    reasoningHealth: reasoningHealthEnum("reasoning_health"),
    reasoningStrategy: reasoningStrategyEnum("reasoning_strategy"),
    inputSnapshot: jsonb("input_snapshot"),
    knowledgeRefs: jsonb("knowledge_refs"),
    canonicalFactRefs: jsonb("canonical_fact_refs"),
    memoryRefs: jsonb("memory_refs"),
    policyRefs: jsonb("policy_refs"),
    constraintRefs: jsonb("constraint_refs"),
    supportingEvidence: jsonb("supporting_evidence"),
    conflictingEvidence: jsonb("conflicting_evidence"),
    assumptions: jsonb("assumptions"),
    hypotheses: jsonb("hypotheses"),
    alternatives: jsonb("alternatives"),
    uncertainty: jsonb("uncertainty"),
    conclusion: text("conclusion"),
    recommendation: text("recommendation"),
    citationMap: jsonb("citation_map"),
    verificationResult: jsonb("verification_result"),
    escalationReason: text("escalation_reason"),
    humanReviewRequired: text("human_review_required"),
    providerMetadata: jsonb("provider_metadata"),
    tokenUsage: jsonb("token_usage"),
    costMetadata: jsonb("cost_metadata"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    concludedAt: timestamp("concluded_at", { withTimezone: true }),
    disposedAt: timestamp("disposed_at", { withTimezone: true }),
    reasoningVersion: integer("reasoning_version").notNull().default(1),
    supersedesReasoningTraceId: uuid("supersedes_reasoning_trace_id").references(
      (): AnyPgColumn => reasoningTraces.id,
    ),
  },
  (t) => [
    index("reasoning_traces_agent_id_idx").on(t.agentId),
    index("reasoning_traces_working_memory_id_idx").on(t.workingMemoryId),
    index("reasoning_traces_supersedes_reasoning_trace_id_idx").on(
      t.supersedesReasoningTraceId,
    ),
  ],
);
