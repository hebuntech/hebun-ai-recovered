import type { HumanApprovalResult, HumanApprovalValidation } from "./types";

export function validateHumanApproval(result: Pick<HumanApprovalResult, "decisions" | "summary">): HumanApprovalValidation {
  const issues: string[] = [];

  for (const decision of result.decisions) {
    if (!decision.reason) {
      issues.push(`Approval decision ${decision.id} is missing a deterministic reason.`);
    }
    if (decision.status === "approved" && decision.nextCommand !== "approval.approve") {
      issues.push(`Approved decision ${decision.id} must map to approval.approve.`);
    }
    if (decision.status === "rejected" && decision.nextCommand !== "approval.reject") {
      issues.push(`Rejected decision ${decision.id} must map to approval.reject.`);
    }
    if (decision.readyForExecution && decision.status !== "approved") {
      issues.push(`Only approved decisions can be marked ready for execution (${decision.id}).`);
    }
  }

  const counted =
    result.summary.pending +
    result.summary.approved +
    result.summary.rejected +
    result.summary.changesRequested;
  if (counted !== result.summary.totalApprovals) {
    issues.push("Approval summary totals do not match the number of resolved approval decisions.");
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

