import type { BadgeVariant } from "@/components/ui/badge";
import type { Approval } from "@/types";
import type { CommandPlan } from "@/features/execution-bridge";
import type { ExecutionSimulation, SimulatedExecutionCommand } from "@/features/execution-engine";
import type { RiskLabel } from "@/features/agent-reasoning";
import type { TaskPlanningResult } from "@/features/task-planning";

export type HumanApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "changes-requested";

export interface ApprovalDecisionTraceability {
  agentId: string;
  agentName: string;
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

export interface ApprovalDecision extends Approval {
  status: HumanApprovalStatus;
  agentId: string;
  agentName: string;
  commandId: string;
  commandType: string;
  commandLabel: string;
  priority: SimulatedExecutionCommand["priority"];
  riskLabel: RiskLabel;
  confidence: number;
  policySignals: string[];
  validationSignals: string[];
  dependencySignals: string[];
  blockedCommands: string[];
  reason: string;
  readyForExecution: boolean;
  nextCommand: "approval.approve" | "approval.reject" | null;
  traceability: ApprovalDecisionTraceability;
}

export interface HumanApprovalSummary {
  totalApprovals: number;
  pending: number;
  approved: number;
  rejected: number;
  changesRequested: number;
  blockedCommands: number;
  readyCommands: number;
  readiness: "blocked" | "approval-required" | "ready";
}

export interface HumanApprovalValidation {
  valid: boolean;
  issues: string[];
}

export interface HumanApprovalHistoryEntry {
  id: string;
  stage: "inspect" | "policy" | "resolve" | "validate" | "report";
  detail: string;
}

export interface HumanApprovalTelemetry {
  approvalsInspected: number;
  approvalsPending: number;
  approvalsApproved: number;
  approvalsRejected: number;
  approvalsChangesRequested: number;
  blockedCommands: number;
  readyCommands: number;
  historyCount: number;
}

export interface HumanApprovalReport {
  approvalPipeline: string;
  readinessSummary: string;
  bottlenecks: string[];
}

export interface HumanApprovalResult {
  simulation: ExecutionSimulation;
  commandPlan: CommandPlan;
  planning: TaskPlanningResult;
  decisions: ApprovalDecision[];
  summary: HumanApprovalSummary;
  validation: HumanApprovalValidation;
  history: HumanApprovalHistoryEntry[];
  telemetry: HumanApprovalTelemetry;
  report: HumanApprovalReport;
}

export interface ExecutiveApprovalMonitorRow {
  agentId: string;
  agentName: string;
  approvals: number;
  pending: number;
  approved: number;
  rejected: number;
  changesRequested: number;
  blockedExecution: number;
  readyCommands: number;
  bottleneck: string;
  badge: BadgeVariant;
}
