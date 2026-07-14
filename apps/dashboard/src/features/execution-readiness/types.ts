import type { BadgeVariant } from "@/components/ui/badge";
import type { HumanApprovalResult } from "@/features/human-approval";

export type ExecutionReadinessStatus = "ready" | "not-ready";

export type ReadinessCheckId =
  | "approval-complete"
  | "dependency-graph-complete"
  | "validation-passed"
  | "owner-assigned"
  | "resources-available"
  | "required-permissions-satisfied"
  | "policies-satisfied"
  | "no-blocked-commands"
  | "no-rejected-approvals"
  | "command-graph-valid"
  | "execution-graph-complete";

export type ReadinessCheckCategory =
  | "approval"
  | "dependency"
  | "validation"
  | "ownership"
  | "resource"
  | "permission"
  | "policy"
  | "command-graph"
  | "execution-graph";

export interface ExecutionReadinessCheck {
  id: ReadinessCheckId;
  label: string;
  category: ReadinessCheckCategory;
  passed: boolean;
  weight: number;
  detail: string;
  recommendation: string;
  relatedIds: string[];
}

export interface ExecutionReadinessSummary {
  score: number;
  status: ExecutionReadinessStatus;
  approvalReadiness: number;
  commandReadiness: number;
  dependencyReadiness: number;
  blockers: number;
  warnings: number;
  estimatedDispatchReadiness: string;
}

export interface ExecutionReadinessValidation {
  valid: boolean;
  issues: string[];
}

export interface ExecutionReadinessHistoryEntry {
  id: string;
  stage: "inspect" | "check" | "score" | "validate" | "report";
  detail: string;
}

export interface ExecutionReadinessTelemetry {
  checksTotal: number;
  checksPassed: number;
  checksFailed: number;
  blockingIssues: number;
  warnings: number;
  readinessScore: number;
  historyCount: number;
}

export interface ExecutionReadinessReport {
  readinessScore: number;
  status: ExecutionReadinessStatus;
  blockingIssues: string[];
  warnings: string[];
  recommendations: string[];
  missingApprovals: string[];
  blockedCommands: string[];
  failedValidations: string[];
  dependencyIssues: string[];
  policyIssues: string[];
  estimatedDispatchReadiness: string;
}

export interface ExecutionReadinessResult {
  approval: HumanApprovalResult;
  checks: ExecutionReadinessCheck[];
  summary: ExecutionReadinessSummary;
  validation: ExecutionReadinessValidation;
  history: ExecutionReadinessHistoryEntry[];
  telemetry: ExecutionReadinessTelemetry;
  report: ExecutionReadinessReport;
}

export interface ExecutiveReadinessDashboardRow {
  agentId: string;
  agentName: string;
  score: number;
  status: ExecutionReadinessStatus;
  approvalReadiness: number;
  dependencyReadiness: number;
  readyCommands: number;
  blockedCommands: number;
  blockingCategory: string;
  dispatchSummary: string;
  trend: string;
  badge: BadgeVariant;
}
