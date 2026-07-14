import type { AvailabilityAssessment, CoordinationStrategy, OrchestrationBlueprint } from "@/features/orchestration/types";
import type { GeneratedPlan } from "@/features/planning";

export function determineCoordinationStrategy(
  plan: GeneratedPlan,
  parallelGroups: string[][],
  availability: AvailabilityAssessment
): CoordinationStrategy {
  if (plan.governance.governanceDecision.status === "approval-required") {
    return "Approval-gated";
  }
  if (availability.overloadedAgents.length > 0) {
    return "Fallback-first";
  }
  if (plan.riskAssessment.some((risk) => risk.level === "critical")) {
    return "Risk-controlled";
  }
  if (parallelGroups.length > 0 && plan.tasks.some((task) => task.type === "validation")) {
    return "Hybrid";
  }
  if (parallelGroups.length > 0) {
    return "Parallel";
  }
  return "Sequential";
}

export function orchestrationStatus(
  strategy: CoordinationStrategy,
  validation: OrchestrationBlueprint["validationResult"],
  availability: AvailabilityAssessment
): OrchestrationBlueprint["status"] {
  if (!validation.valid) return "blocked";
  if (strategy === "Approval-gated") return "approval-gated";
  if (availability.overloadedAgents.length > 0 || availability.constrainedAgents.length > 0) {
    return "fallback-required";
  }
  return "ready";
}
