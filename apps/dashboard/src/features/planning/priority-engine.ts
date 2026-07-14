import type { GovernanceResult } from "@/features/policy";
import type { PlanningPriority } from "@/features/planning/types";

export function determinePlanningPriority(governance: GovernanceResult): PlanningPriority {
  if (governance.riskAssessment.level === "critical") return "critical";
  if (
    governance.riskAssessment.level === "high" ||
    governance.governanceDecision.status === "approval-required"
  ) {
    return "high";
  }
  if (governance.confidence < 84) return "medium";
  return "low";
}
