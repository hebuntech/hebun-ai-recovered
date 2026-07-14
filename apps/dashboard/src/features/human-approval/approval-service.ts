import { getAgentExecutionSimulation, getExecutiveExecutionSimulations } from "@/features/execution-engine";
import { getAgentPlan, getActivePlans } from "@/features/task-planning";
import { buildHumanApprovalResolution } from "./approval-engine";
import type { BadgeVariant } from "@/components/ui/badge";
import type { ExecutiveApprovalMonitorRow, HumanApprovalResult } from "./types";

function approvalMonitorBadge(status: "pending" | "approved" | "rejected" | "changes-requested"): BadgeVariant {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "error";
    case "changes-requested":
      return "info";
    case "pending":
    default:
      return "warning";
  }
}

export function getAgentHumanApproval(agentId: string): HumanApprovalResult | null {
  const execution = getAgentExecutionSimulation(agentId);
  const planning = getAgentPlan(agentId);
  return execution && planning ? buildHumanApprovalResolution(execution, planning) : null;
}

export function getExecutiveHumanApprovals(): HumanApprovalResult[] {
  const planByAgentId = new Map(getActivePlans().map((item) => [item.agent.id, item]));
  return getExecutiveExecutionSimulations()
    .map((execution) => {
      const planning = planByAgentId.get(execution.simulation.executionPlan.agentId);
      return planning ? buildHumanApprovalResolution(execution, planning) : null;
    })
    .filter((item): item is HumanApprovalResult => item !== null);
}

export function getExecutiveApprovalMonitor(): ExecutiveApprovalMonitorRow[] {
  return getExecutiveHumanApprovals().map((result) => {
    const bottleneck = result.report.bottlenecks[0] ?? "No approval bottlenecks.";
    return {
      agentId: result.planning.agent.id,
      agentName: result.planning.agent.name,
      approvals: result.summary.totalApprovals,
      pending: result.summary.pending,
      approved: result.summary.approved,
      rejected: result.summary.rejected,
      changesRequested: result.summary.changesRequested,
      blockedExecution: result.summary.blockedCommands,
      readyCommands: result.summary.readyCommands,
      bottleneck,
      badge: approvalMonitorBadge(
        result.summary.rejected > 0
          ? "rejected"
          : result.summary.pending > 0
            ? "pending"
            : result.summary.changesRequested > 0
              ? "changes-requested"
              : "approved"
      ),
    };
  });
}
