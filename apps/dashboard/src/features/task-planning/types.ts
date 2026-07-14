/*
 * Task Planning — types.
 *
 * The planning layer sits directly above Agent Reasoning. It consumes a
 * Decision Package (the deterministic output of the reasoning pipeline) and
 * transforms it into an Execution Plan through a fixed, traceable pipeline:
 * goal → tasks → dependencies → resources → approvals → timeline → plan.
 *
 * No LLM, no randomness, no execution, no orchestration. This layer only
 * PREPARES execution. Same Decision Package → same Execution Plan, every time.
 * Every task traces back to decision → reasoning → context → memory → knowledge.
 */

import type { AgentCrudRecord } from "@/features/agent-crud";
import type { DecisionPackage } from "@/features/agent-reasoning";

/* ------------------------------------------------------------ Shared ----- */

/** Priority mirrors the reasoning layer's GoalPriority — no re-derivation. */
export type PlanPriority = "critical" | "high" | "medium" | "low";

/* -------------------------------------------------------- Goal Planning -- */

export interface PlannedGoal {
  primaryGoal: string;
  supportingGoals: string[];
  deliverables: string[];
  completionCriteria: string[];
  priority: PlanPriority;
}

/* ------------------------------------------------------ Task Generation -- */

/** Who a planned task is prepared for. Never executed — reference only. */
export type TaskOwnerType = "agent" | "workflow" | "department" | "human";

/** Deterministic phase a task belongs to. Drives ordering + timeline. */
export type TaskCategory =
  | "preparation"
  | "information"
  | "core"
  | "validation"
  | "handoff";

/** Planning never executes — every task is prepared and stays `planned`. */
export type TaskStatus = "planned";

/**
 * Full traceability chain for a task. Answers "why does this task exist?"
 * by pointing back through the deterministic cognitive pipeline.
 */
export interface TaskTrace {
  decision: string;
  reasoning: string;
  context: string;
  memory: string;
  knowledge: string;
}

export interface PlannedTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  ownerType: TaskOwnerType;
  ownerId: string;
  /** Estimated effort in minutes. Deterministic, derived from decision. */
  estimatedDuration: number;
  priority: PlanPriority;
  status: TaskStatus;
  requiredCapabilities: string[];
  expectedOutput: string;
  trace: TaskTrace;
}

/* --------------------------------------------------- Dependency Engine --- */

export type DependencyKind = "sequential" | "parallel";

export interface TaskDependency {
  taskId: string;
  dependsOn: string[];
  blocks: string[];
  kind: DependencyKind;
}

export interface DependencyGraph {
  dependencies: TaskDependency[];
  /** Groups of task ids that may run concurrently within a stage. */
  parallelGroups: string[][];
  /** Ordered task ids forming the longest-duration chain. */
  criticalPath: string[];
  criticalPathDuration: number;
  parallelCount: number;
  sequentialCount: number;
}

/* ---------------------------------------------------- Resource Planning -- */

export type ResourceKind =
  | "agent"
  | "workflow"
  | "department"
  | "knowledge"
  | "memory";

export interface ResourceRef {
  kind: ResourceKind;
  id: string;
  label: string;
  reason: string;
}

export interface PlannedResources {
  requiredAgents: ResourceRef[];
  requiredWorkflows: ResourceRef[];
  requiredDepartments: ResourceRef[];
  requiredKnowledge: ResourceRef[];
  requiredMemory: ResourceRef[];
}

/* ---------------------------------------------------- Approval Planning -- */

export type ApprovalGateType =
  | "policy"
  | "legal"
  | "finance"
  | "executive"
  | "human";

export interface ApprovalGate {
  id: string;
  type: ApprovalGateType;
  label: string;
  reason: string;
  /** The task this gate guards — execution may not pass it until cleared. */
  blocksTaskId: string;
  required: boolean;
}

/* ----------------------------------------------------- Timeline Planning - */

export interface ExecutionStage {
  order: number;
  label: string;
  category: TaskCategory;
  taskIds: string[];
  /** Stage duration = longest task in the stage (tasks run in parallel). */
  estimatedDuration: number;
}

export interface Milestone {
  id: string;
  label: string;
  afterStage: number;
  criteria: string;
}

export interface Timeline {
  stages: ExecutionStage[];
  milestones: Milestone[];
  estimatedTotalDuration: number;
  /** Human-readable estimate, e.g. "~2h 15m". */
  estimatedCompletion: string;
}

/* ------------------------------------------------------- Execution Plan -- */

export type PlanReadiness = "ready" | "needs-approval" | "blocked";

export interface PlanningSummary {
  taskCount: number;
  approvalCount: number;
  parallelCount: number;
  sequentialCount: number;
  criticalPathDuration: number;
  estimatedTotalDuration: number;
  priority: PlanPriority;
  readiness: PlanReadiness;
  recommendedAction: string;
}

export interface ExecutionPlan {
  id: string;
  agentId: string;
  agentName: string;
  goal: PlannedGoal;
  tasks: PlannedTask[];
  dependencies: DependencyGraph;
  resources: PlannedResources;
  approvals: ApprovalGate[];
  timeline: Timeline;
  expectedOutputs: string[];
  summary: PlanningSummary;
}

/** Compact projection for dashboards and the Director planning overview. */
export interface PlanningReport {
  agentId: string;
  agentName: string;
  primaryGoal: string;
  taskCount: number;
  approvalCount: number;
  criticalPathLength: number;
  criticalPathDuration: number;
  estimatedCompletion: string;
  priority: PlanPriority;
  readiness: PlanReadiness;
}

/** Full result: the agent, its decision, the plan, and the report. */
export interface TaskPlanningResult {
  agent: AgentCrudRecord;
  decision: DecisionPackage;
  plan: ExecutionPlan;
  report: PlanningReport;
}
