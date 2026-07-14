import type { CommandPlan } from "@/features/execution-bridge";
import type { CommandCandidate } from "@/features/execution-bridge";

function hasResource(plan: CommandPlan, candidate: CommandCandidate): boolean {
  const resources = plan.executionPlan.resources;
  if (candidate.owner.type === "agent") {
    return resources.requiredAgents.some((item) => item.id === candidate.owner.id);
  }
  if (candidate.owner.type === "workflow") {
    return resources.requiredWorkflows.some((item) => item.id === candidate.owner.id);
  }
  if (candidate.owner.type === "department") {
    return resources.requiredDepartments.some((item) => item.id === candidate.owner.id);
  }
  return Boolean(candidate.owner.id);
}

export function simulateMissingResources(
  plan: CommandPlan,
  candidate: CommandCandidate
): string[] {
  if (hasResource(plan, candidate)) return [];
  return [`Missing resource reference for ${candidate.owner.type}:${candidate.owner.id}`];
}

export function simulateFailureReasons(
  plan: CommandPlan,
  candidate: CommandCandidate
): string[] {
  const validationIssues = plan.validation.issues
    .filter(
      (issue) =>
        issue.commandId === candidate.id ||
        issue.relatedIds?.includes(candidate.id)
    )
    .map((issue) => issue.message);

  const ownerIssues =
    !candidate.owner.id || !candidate.owner.type
      ? [`Missing owner for ${candidate.id}`]
      : [];

  return [
    ...validationIssues,
    ...ownerIssues,
    ...simulateMissingResources(plan, candidate),
  ];
}

