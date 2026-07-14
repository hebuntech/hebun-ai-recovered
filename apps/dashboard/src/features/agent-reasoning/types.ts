/*
 * Agent Reasoning — types.
 *
 * The reasoning layer sits directly above Agent Context. It consumes a Context
 * Package and transforms it into a deterministic Decision Package through a
 * fixed pipeline: goal → constraints → options → risk → confidence → decision.
 * No LLM, no randomness, no execution. Read only. Every step is traceable.
 */

import type { AgentCrudRecord } from "@/features/agent-crud";
import type { AgentContextPackage } from "@/features/agent-context";

/* ---------------------------------------------------------------- Goal ---- */

export type GoalPriority = "critical" | "high" | "medium" | "low";

export interface GoalAnalysis {
  primaryGoal: string;
  supportingGoals: string[];
  priority: GoalPriority;
  successCriteria: string[];
}

/* -------------------------------------------------------- Constraints ---- */

export interface ConstraintAnalysis {
  policies: string[];
  permissions: string[];
  workflowLimits: string[];
  departmentLimits: string[];
  missingInformation: string[];
  /** 0-1: fraction of constraint categories that are satisfied/known. */
  completeness: number;
}

/* ------------------------------------------------------------ Options ---- */

export type ReasoningOptionId =
  | "proceed"
  | "escalate"
  | "request-approval"
  | "collect-more-information"
  | "reject";

export interface ReasoningOption {
  id: ReasoningOptionId;
  label: string;
  rationale: string;
  /** 0-100 deterministic suitability score. */
  score: number;
  eligible: boolean;
}

/* --------------------------------------------------------------- Risk ---- */

export type RiskLabel = "low" | "medium" | "high";

export interface RiskAnalysis {
  policyRisk: number;
  knowledgeGapRisk: number;
  missingContextRisk: number;
  lowConfidenceRisk: number;
  dependencyRisk: number;
  /** 0-100 blended overall risk. */
  overallRisk: number;
  label: RiskLabel;
  factors: string[];
}

/* --------------------------------------------------------- Confidence ---- */

export type ConfidenceLabel = "high" | "medium" | "low";
export type ReasoningQuality = "robust" | "adequate" | "thin";

export interface ConfidenceResult {
  score: number;
  label: ConfidenceLabel;
  reasoningQuality: ReasoningQuality;
  inputs: {
    memoryConfidence: number;
    knowledgeCoverage: number;
    contextHealth: number;
    constraintCompleteness: number;
    riskScore: number;
  };
}

/* ---------------------------------------------------------- Traceability -- */

export type ReasoningStage =
  | "goal-analysis"
  | "constraint-analysis"
  | "option-generation"
  | "risk-analysis"
  | "confidence-evaluation"
  | "decision";

export interface ReasoningStep {
  stage: ReasoningStage;
  input: string;
  evaluation: string;
  output: string;
  evidence: string[];
}

/* ------------------------------------------------------- Decision Package - */

export interface DecisionContextSummary {
  retrievedMemories: number;
  knowledgeNodes: number;
  relationships: number;
  relatedMemories: number;
  contextHealth: number;
  averageConfidence: number;
  topMemory: string;
}

export interface DecisionPackage {
  agentId: string;
  agentName: string;
  goal: GoalAnalysis;
  contextSummary: DecisionContextSummary;
  constraints: ConstraintAnalysis;
  options: ReasoningOption[];
  recommendedOption: ReasoningOption;
  risk: RiskAnalysis;
  confidence: ConfidenceResult;
  reasoningTrace: ReasoningStep[];
}

/** Compact projection for dashboards and the Director overview. */
export interface ReasoningReport {
  agentId: string;
  agentName: string;
  primaryGoal: string;
  recommendedAction: string;
  recommendedOptionId: ReasoningOptionId;
  confidence: number;
  confidenceLabel: ConfidenceLabel;
  reasoningQuality: ReasoningQuality;
  risk: number;
  riskLabel: RiskLabel;
  optionCount: number;
}

/** Full result: the agent it belongs to, its context, and the decision. */
export interface AgentReasoningResult {
  agent: AgentCrudRecord;
  contextPackage: AgentContextPackage;
  decision: DecisionPackage;
  report: ReasoningReport;
}
