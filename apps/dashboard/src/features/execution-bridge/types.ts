import type { CommandType } from "@/features/commands/pipeline";
import type { CommandDefinition } from "@/features/commands/registry";
import type {
  ApprovalGate,
  ExecutionPlan,
  PlannedTask,
  PlanPriority,
  TaskOwnerType,
} from "@/features/task-planning";

export type CommandCandidateStatus =
  | "ready"
  | "waiting-dependencies"
  | "waiting-approval"
  | "blocked";

export interface CommandCandidateTraceability {
  taskId: string;
  taskTitle: string;
  taskCategory: PlannedTask["category"];
  decision: string;
  reasoning: string;
  context: string;
  memory: string;
  knowledge: string;
}

export interface CommandCandidate {
  id: string;
  taskId: string;
  title: string;
  commandType: CommandType;
  commandLabel: string;
  owner: {
    type: TaskOwnerType;
    id: string;
  };
  priority: PlanPriority;
  dependencies: string[];
  approvalGateIds: string[];
  requiredApproval: boolean;
  estimatedDuration: number;
  status: CommandCandidateStatus;
  traceability: CommandCandidateTraceability;
  payload: Record<string, unknown>;
  definition?: CommandDefinition;
}

export interface CommandDependencyNode {
  commandId: string;
  dependsOn: string[];
  blocks: string[];
  dependencyKind: "sequential" | "parallel";
  blockedByApprovalGateIds: string[];
}

export interface CommandDependencyGraph {
  nodes: CommandDependencyNode[];
  parallelGroups: string[][];
  criticalPath: string[];
  approvalDependencies: Array<{
    gateId: string;
    commandId: string;
  }>;
  blockedCommands: string[];
}

export interface ExecutionOrderStage {
  order: number;
  label: string;
  commandIds: string[];
  estimatedDuration: number;
}

export interface ValidationIssue {
  code:
    | "missing-owner"
    | "missing-command-type"
    | "invalid-dependency"
    | "circular-dependency"
    | "duplicate-command"
    | "missing-approval";
  message: string;
  commandId?: string;
  relatedIds?: string[];
}

export interface CommandValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export interface CommandPlanSummary {
  totalCommands: number;
  totalApprovals: number;
  blockedCommands: number;
  criticalPathLength: number;
  estimatedDuration: number;
  estimatedDurationLabel: string;
  readiness: ExecutionPlan["summary"]["readiness"];
}

export interface CommandPlan {
  id: string;
  executionPlan: ExecutionPlan;
  commandCandidates: CommandCandidate[];
  dependencyGraph: CommandDependencyGraph;
  approvalGates: ApprovalGate[];
  executionOrder: ExecutionOrderStage[];
  estimatedDuration: number;
  summary: CommandPlanSummary;
  validation: CommandValidationResult;
}

export interface ExecutionPreview {
  agentId: string;
  agentName: string;
  commands: CommandCandidate[];
  dependencies: CommandDependencyGraph;
  executionOrder: ExecutionOrderStage[];
  approvalGates: ApprovalGate[];
  criticalPath: string[];
  estimatedDuration: string;
  summary: CommandPlanSummary;
  validation: CommandValidationResult;
}

export interface ExecutionHistoryEntry {
  id: string;
  stage: "mapping" | "dependency-resolution" | "validation" | "preview";
  detail: string;
}

export interface ExecutionBridgeTelemetry {
  creates: number;
  updates: number;
  archives: number;
  restores: number;
  softDeletes: number;
  validationFailures: number;
  commandLatencyMs: number;
  historyCount: number;
}

export interface ExecutionBridgeReport {
  planId: string;
  agentId: string;
  agentName: string;
  telemetry: ExecutionBridgeTelemetry;
  history: ExecutionHistoryEntry[];
}

