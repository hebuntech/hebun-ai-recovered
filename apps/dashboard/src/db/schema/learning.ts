/*
 * Learning — improvement analysis and proposal foundation.
 *
 * Learning stores governed analysis sessions and reversible improvement
 * proposals only. It never applies changes itself and never mutates authority,
 * permissions, identity, Knowledge, Memory, Policy, Mission, Goals, Plans, or
 * Execution directly.
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
  improvementProposalTypeEnum,
  learningHealthEnum,
  learningLifecycleStatusEnum,
  learningTypeEnum,
} from "./_enums";
import { agents } from "./agent";
import { governanceSessions, decisionRecords } from "./governance";

export const learningSessions = pgTable(
  "learning_sessions",
  {
    ...tenantColumns,
    agentId: uuid("agent_id").references(() => agents.id),
    learningType: learningTypeEnum("learning_type"),
    learningLifecycleStatus: learningLifecycleStatusEnum(
      "learning_lifecycle_status",
    ),
    learningHealth: learningHealthEnum("learning_health"),
    subjectType: text("subject_type"),
    subjectId: text("subject_id"),
    reasoningTraceRefs: jsonb("reasoning_trace_refs"),
    executionRefs: jsonb("execution_refs"),
    memoryRefs: jsonb("memory_refs"),
    knowledgeRefs: jsonb("knowledge_refs"),
    humanFeedbackRefs: jsonb("human_feedback_refs"),
    expectedOutcome: jsonb("expected_outcome"),
    actualOutcome: jsonb("actual_outcome"),
    detectedPatterns: jsonb("detected_patterns"),
    rootCauseAnalysis: jsonb("root_cause_analysis"),
    safetyChecks: jsonb("safety_checks"),
    driftSignals: jsonb("drift_signals"),
    regressionSignals: jsonb("regression_signals"),
    biasSignals: jsonb("bias_signals"),
    hallucinationReinforcementSignals: jsonb(
      "hallucination_reinforcement_signals",
    ),
    costMetadata: jsonb("cost_metadata"),
    correlationId: text("correlation_id"),
    causationId: text("causation_id"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    learningVersion: integer("learning_version").notNull().default(1),
  },
  (t) => [
    index("learning_sessions_agent_id_idx").on(t.agentId),
    index("learning_sessions_subject_idx").on(t.subjectType, t.subjectId),
    index("learning_sessions_correlation_id_idx").on(t.correlationId),
  ],
);

export const improvementProposals = pgTable(
  "improvement_proposals",
  {
    ...tenantColumns,
    learningSessionId: uuid("learning_session_id").references(
      () => learningSessions.id,
    ),
    improvementProposalType: improvementProposalTypeEnum(
      "improvement_proposal_type",
    ),
    targetModule: text("target_module"),
    targetType: text("target_type"),
    targetId: text("target_id"),
    proposal: jsonb("proposal"),
    expectedBenefit: jsonb("expected_benefit"),
    supportingEvidence: jsonb("supporting_evidence"),
    conflictingEvidence: jsonb("conflicting_evidence"),
    riskAssessment: jsonb("risk_assessment"),
    validationPlan: jsonb("validation_plan"),
    rollbackPlan: jsonb("rollback_plan"),
    provenance: jsonb("provenance"),
    proposalVersion: integer("proposal_version").notNull().default(1),
    governanceSessionId: uuid("governance_session_id").references(
      () => governanceSessions.id,
    ),
    decisionRecordId: uuid("decision_record_id").references(
      () => decisionRecords.id,
    ),
    proposedByActorType: actorTypeEnum("proposed_by_actor_type"),
    proposedByActorId: uuid("proposed_by_actor_id"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    appliedAt: timestamp("applied_at", { withTimezone: true }),
    rolledBackAt: timestamp("rolled_back_at", { withTimezone: true }),
    supersedesProposalId: uuid("supersedes_proposal_id").references(
      (): AnyPgColumn => improvementProposals.id,
    ),
  },
  (t) => [
    index("improvement_proposals_learning_session_id_idx").on(t.learningSessionId),
    index("improvement_proposals_target_idx").on(
      t.targetModule,
      t.targetType,
      t.targetId,
    ),
    index("improvement_proposals_supersedes_proposal_id_idx").on(
      t.supersedesProposalId,
    ),
  ],
);
