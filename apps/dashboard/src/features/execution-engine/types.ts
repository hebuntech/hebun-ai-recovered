import type { BadgeVariant } from "@/components/ui/badge";
import type {
  ApprovalGate,
  ExecutionPlan,
  PlanReadiness,
  PlanPriority,
} from "@/features/task-planning";
import type {
  CommandCandidate,
  CommandPlan,
  CommandValidationResult,
} from "@/features/execution-bridge";

export type SimulatedExecutionState =
  | "pending"
  | "waiting-dependencies"
  | "waiting-approval"
  | "ready"
  | "running"
  | "completed"
  | "failed"
  | "blocked"
  | "cancelled"
  | "skipped";

export type SimulatedApprovalState =
  | "waiting-approval"
  | "approved"
  | "rejected"
  | "pending";

export interface SimulatedApprovalGate {
  id: string;
  gate: ApprovalGate;
  state: SimulatedApprovalState;
  commandIds: string[];
  reason: string;
}

export interface SimulatedExecutionTraceability {
  commandId: string;
  commandType: string;
  taskId: string;
  taskTitle: string;
  decision: string;
  reasoning: string;
  context: string;
  memory: string;
  knowledge: string;
}

export interface SimulatedExecutionCommand {
  id: string;
  commandId: string;
  commandType: string;
  commandLabel: string;
  title: string;
  owner: CommandCandidate["owner"];
  priority: PlanPriority;
  dependencies: string[];
  approvalGateIds: string[];
  approvalState: SimulatedApprovalState;
  estimatedDuration: number;
  stageOrder: number;
  stageLabel: string;
  state: SimulatedExecutionState;
  lifecycle: SimulatedExecutionState[];
  blockingReason?: string;
  failureReasons: string[];
  missingResources: string[];
  traceability: SimulatedExecutionTraceability;
}

export interface SimulatedExecutionQueue {
  items: SimulatedExecutionCommand[];
}

export interface SimulatedExecutionTimelineStage {
  order: number;
  label: string;
  commandIds: string[];
  estimatedDuration: number;
  state: SimulatedExecutionState;
  completedCount: number;
  blockedCount: number;
  progress: number;
}

export interface SimulatedExecutionSummary {
  totalCommands: number;
  completed: number;
  blocked: number;
  waiting: number;
  failed: number;
  skipped: number;
  completionPercent: number;
  readiness: PlanReadiness;
  criticalPathLength: number;
  estimatedDuration: number;
  estimatedDurationLabel: string;
}

export interface SimulatedExecutionReport {
  executionQueue: SimulatedExecutionQueue;
  completed: number;
  blocked: number;
  waiting: number;
  failed: number;
  estimatedProgress: number;
  estimatedCompletion: string;
  executionSummary: string;
}

export interface ExecutionSimulation {
  id: string;
  planId: string;
  commandPlan: CommandPlan;
  executionPlan: ExecutionPlan;
  queue: SimulatedExecutionQueue;
  approvals: SimulatedApprovalGate[];
  timeline: SimulatedExecutionTimelineStage[];
  report: SimulatedExecutionReport;
  summary: SimulatedExecutionSummary;
  validation: CommandValidationResult;
  state: SimulatedExecutionState;
}

export interface ExecutionEngineTelemetry {
  queuedCommands: number;
  completedCommands: number;
  blockedCommands: number;
  waitingCommands: number;
  failedCommands: number;
  approvalCount: number;
  historyCount: number;
}

export interface ExecutionEngineHistoryEntry {
  id: string;
  stage: "queue" | "dependency-check" | "approval-gates" | "simulation" | "report";
  detail: string;
}

export interface ExecutionEngineResult {
  simulation: ExecutionSimulation;
  telemetry: ExecutionEngineTelemetry;
  history: ExecutionEngineHistoryEntry[];
}

export interface ExecutiveExecutionSimulationRow {
  agentId: string;
  agentName: string;
  progress: number;
  blockedCommands: number;
  approvalStatus: SimulatedApprovalState;
  criticalPath: number;
  completionPercent: number;
  estimatedCompletion: string;
  state: SimulatedExecutionState;
  badge: BadgeVariant;
}
