import type {
  AgentAssignment,
  ApprovalGate,
  AvailabilityAssessment,
  FallbackPlan,
  HumanAssignment,
  OrchestrationValidationResult,
} from "@/features/orchestration/types";
import type { GeneratedPlan } from "@/features/planning";
import { hasCircularDependencies } from "@/features/orchestration/dependency-resolver";

export function validateOrchestrationPlan(
  plan: GeneratedPlan,
  agentAssignments: AgentAssignment[],
  humanAssignments: HumanAssignment[],
  approvalGates: ApprovalGate[],
  availability: AvailabilityAssessment,
  fallbackStrategy: FallbackPlan[]
): OrchestrationValidationResult {
  const issues: string[] = [];
  const missingAgentOwnership = plan.tasks.some(
    (task) => !agentAssignments.find((assignment) => assignment.taskId === task.id)
  );
  const missingCapabilities = plan.tasks.some((task) => task.requiredCapabilityIds.length === 0);
  const missingTools = plan.tasks.some((task) => task.requiredToolIds.length === 0);
  const unresolvedDependencies = plan.dependencies.some(
    (dependency) =>
      dependency.dependsOn.some((taskId) => !plan.tasks.find((task) => task.id === taskId))
  );
  const circularDependencies = hasCircularDependencies(plan);
  const approvalConflicts = plan.governance.requiredApprovals.length > 0 && approvalGates.length === 0;
  const capacityOverload = availability.overloadedAgents.length > 0;
  const unavailableAgents = agentAssignments.some((assignment) => assignment.status === "fallback");
  const missingFallbackOwners = fallbackStrategy.some((item) => item.fallbackAgents.length === 0);
  const humanEscalationGaps = humanAssignments.length === 0 && unavailableAgents;

  if (missingAgentOwnership) issues.push("At least one task has no agent assignment.");
  if (missingCapabilities) issues.push("At least one task is missing explicit capability requirements.");
  if (missingTools) issues.push("At least one task is missing explicit tool requirements.");
  if (unresolvedDependencies) issues.push("At least one dependency points to a missing task.");
  if (circularDependencies) issues.push("Circular task dependencies were detected.");
  if (approvalConflicts) issues.push("Approval requirements exist without orchestration gates.");
  if (capacityOverload) issues.push("One or more assigned agents are overloaded or unavailable.");
  if (unavailableAgents) issues.push("At least one primary assignment requires fallback handling.");
  if (missingFallbackOwners) issues.push("At least one task is missing fallback agent coverage.");
  if (humanEscalationGaps) issues.push("Unavailable work has no human escalation path.");

  const valid =
    !missingAgentOwnership &&
    !unresolvedDependencies &&
    !circularDependencies &&
    !approvalConflicts &&
    !missingFallbackOwners &&
    !humanEscalationGaps;

  return {
    valid,
    issues,
    checks: {
      missingAgentOwnership,
      missingCapabilities,
      missingTools,
      unresolvedDependencies,
      circularDependencies,
      approvalConflicts,
      capacityOverload,
      unavailableAgents,
      missingFallbackOwners,
      humanEscalationGaps,
    },
    summary: valid
      ? "The orchestration blueprint is explainable, fully assigned, and safe to hand forward to a future execution system."
      : "The orchestration blueprint is structurally useful, but it still carries assignment, approval, or fallback issues that must be addressed first.",
  };
}
