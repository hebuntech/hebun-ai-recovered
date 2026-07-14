import type { GeneratedPlan } from "@/features/planning";
import type { ApprovalGate } from "@/features/orchestration/types";

export function buildApprovalGates(plan: GeneratedPlan): ApprovalGate[] {
  const taskGates = plan.tasks
    .filter((task) => task.type === "validation" || task.type === "governance")
    .map((task, index) => ({
      id: `${plan.id}-approval-task-${index + 1}`,
      taskId: task.id,
      mode: plan.governance.requiredApprovals[0] ?? "none",
      owner: plan.owner,
      summary: `Approval or review must clear before ${task.title.toLowerCase()} can conclude.`,
      status:
        plan.governance.governanceDecision.status === "allow" ? "cleared" : "pending",
    }) satisfies ApprovalGate);

  const governanceGates = plan.governance.approvalRequirements.map((approval, index) => ({
    id: `${plan.id}-approval-governance-${index + 1}`,
    mode: approval.mode,
    owner: approval.owner,
    summary: approval.detail,
    status: approval.mode === "none" ? "cleared" : "required",
  }) satisfies ApprovalGate);

  return [...taskGates, ...governanceGates];
}
