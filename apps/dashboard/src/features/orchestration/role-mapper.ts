import type { GeneratedPlan, PlanTask } from "@/features/planning";
import type { HumanAssignment } from "@/features/orchestration/types";

function departmentFromPlanOwner(owner: string) {
  if (owner.includes("Legal")) return "Legal";
  if (owner.includes("Finance")) return "Finance";
  if (owner.includes("HR")) return "HR";
  if (owner.includes("Sales")) return "Sales";
  return "Director";
}

export function mapHumanAssignment(
  plan: GeneratedPlan,
  task: PlanTask
): HumanAssignment | undefined {
  const needsHuman =
    task.type === "alignment" ||
    task.type === "validation" ||
    task.type === "governance" ||
    plan.governance.governanceDecision.status === "approval-required";

  if (!needsHuman) return undefined;

  const role =
    task.type === "validation"
      ? "Planning Engine Reviewer"
      : task.type === "governance"
        ? "Governance Reviewer"
        : plan.owner;

  return {
    id: `${plan.id}-${task.id}-human`,
    taskId: task.id,
    role,
    department: departmentFromPlanOwner(plan.owner),
    responsibility: `Own the human checkpoint for ${task.title.toLowerCase()} and keep the orchestration path auditable.`,
    approvalRequired: task.type !== "alignment",
    escalationPath: [role, "Director", "Executive Approval Board"],
  };
}
