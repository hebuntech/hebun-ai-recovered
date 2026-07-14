import { policyRegistry } from "@/features/policy/policy-registry";
import type { PolicyResult } from "@/features/policy/types";
import type { ReasoningResult } from "@/features/reasoning";

export function evaluatePolicies(reasoning: ReasoningResult): PolicyResult[] {
  return policyRegistry.map((policy) => {
    const applies = policy.appliesTo.some((registryId) =>
      reasoning.relatedRegistryIds.includes(registryId)
    );
    const riskTriggered = policy.triggerRiskLevel === reasoning.riskLevel;
    const status =
      policy.reviewRequired || riskTriggered
        ? "watch"
        : applies
          ? "pass"
          : "pass";

    return {
      policyId: policy.id,
      policyName: policy.name,
      category: policy.category,
      status,
      detail: applies
        ? status === "watch"
          ? "The policy applies and requires explicit review before progression."
          : "The reasoning result satisfies the applicable policy rule."
        : "The policy was checked and does not constrain this reasoning context.",
    };
  });
}
