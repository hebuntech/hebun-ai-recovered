import type { GovernanceResult } from "@/features/policy";
import type { GeneratedPlan, PlanSuccessCriterion, PlanningGoal } from "@/features/planning/types";

export function defineSuccessCriteria(
  goal: PlanningGoal,
  governance: GovernanceResult
): PlanSuccessCriterion[] {
  return [
    {
      id: `${governance.id}-success-1`,
      label: "Goal alignment preserved",
      detail: `${goal.title} remains the explicit business anchor for every task and milestone.`,
    },
    {
      id: `${governance.id}-success-2`,
      label: "Governance trace remains attached",
      detail: "Reasoning, policy, approvals, and risk references remain visible on the plan.",
    },
    {
      id: `${governance.id}-success-3`,
      label: "Execution blueprint is reusable",
      detail: "Ordered tasks, parallel tasks, rollback points, and completion criteria can be reused without hidden assumptions.",
    },
    {
      id: `${governance.id}-success-4`,
      label: "Existing objects are referenced, not duplicated",
      detail: "The plan points back to registry, graph, memory, reasoning, and governance objects rather than creating disconnected copies.",
    },
  ];
}

export function planStatusFromSignals(
  governance: GovernanceResult,
  risks: GeneratedPlan["riskAssessment"],
  utilizationScore: number
): GeneratedPlan["status"] {
  if (risks.some((risk) => risk.level === "critical") || utilizationScore >= 93) {
    return "blocked";
  }
  if (
    governance.governanceDecision.status === "approval-required" ||
    governance.approvalRequirements.some((item) => item.mode !== "none")
  ) {
    return "in-review";
  }
  return "ready";
}
