import type { BadgeVariant } from "@/components/ui/badge";
import { getAgentHumanApproval, getExecutiveHumanApprovals } from "@/features/human-approval";
import { buildExecutionReadiness } from "./readiness-engine";
import type {
  ExecutiveReadinessDashboardRow,
  ExecutionReadinessResult,
  ExecutionReadinessStatus,
} from "./types";

function readinessBadge(status: ExecutionReadinessStatus): BadgeVariant {
  return status === "ready" ? "success" : "warning";
}

function dominantBlockingCategory(result: ExecutionReadinessResult): string {
  const failed = result.checks.filter((check) => !check.passed);
  return failed[0]?.category ?? "none";
}

function readinessTrend(result: ExecutionReadinessResult): string {
  if (result.summary.status === "ready" && result.summary.score >= 90) return "stable-ready";
  if (result.summary.blockers >= 3) return "constrained";
  if (result.summary.score >= 70) return "improving";
  return "watch";
}

export function getAgentExecutionReadiness(
  agentId: string
): ExecutionReadinessResult | null {
  const approval = getAgentHumanApproval(agentId);
  return approval ? buildExecutionReadiness(approval) : null;
}

export function getExecutiveExecutionReadiness(): ExecutionReadinessResult[] {
  return getExecutiveHumanApprovals().map((approval) => buildExecutionReadiness(approval));
}

export function getExecutiveReadinessDashboard(): ExecutiveReadinessDashboardRow[] {
  return getExecutiveExecutionReadiness().map((result) => ({
    agentId: result.approval.planning.agent.id,
    agentName: result.approval.planning.agent.name,
    score: result.summary.score,
    status: result.summary.status,
    approvalReadiness: result.summary.approvalReadiness,
    dependencyReadiness: result.summary.dependencyReadiness,
    readyCommands: result.approval.summary.readyCommands,
    blockedCommands: result.approval.summary.blockedCommands,
    blockingCategory: dominantBlockingCategory(result),
    dispatchSummary: result.report.estimatedDispatchReadiness,
    trend: readinessTrend(result),
    badge: readinessBadge(result.summary.status),
  }));
}
