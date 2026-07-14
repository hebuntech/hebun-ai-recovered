import { policyRegistry } from "@/features/policy/policy-registry";
import type { ApprovalRequirement } from "@/features/policy/types";
import type { ReasoningResult } from "@/features/reasoning";

export function determineApprovals(
  reasoning: ReasoningResult
): ApprovalRequirement[] {
  const applicable = policyRegistry.filter(
    (policy) =>
      policy.reviewRequired ||
      policy.appliesTo.some((registryId) =>
        reasoning.relatedRegistryIds.includes(registryId)
      )
  );

  const requirements = applicable
    .filter((policy) => policy.approvalMode !== "none")
    .map((policy) => ({
      mode: policy.approvalMode,
      detail: `${policy.name} requires ${policy.approvalMode} approval.`,
      owner: policy.owner,
    }));

  if (requirements.length > 0) return requirements;
  return [
    {
      mode: reasoning.riskLevel === "low" ? "none" : "human-review",
      detail:
        reasoning.riskLevel === "low"
          ? "No additional approval is required for this low-risk recommendation."
          : "A human review is required for this recommendation risk level.",
      owner: "Governance Core",
    },
  ];
}
