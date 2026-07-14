import type { PolicyResult } from "@/features/policy/types";
import type { ReasoningResult } from "@/features/reasoning";

export function validateGovernanceConstraints(
  reasoning: ReasoningResult,
  policyResults: PolicyResult[]
) {
  const failedPolicies = policyResults.filter((result) => result.status === "fail").length;
  const failedReasoningConstraints = reasoning.constraints.filter(
    (constraint) => constraint.status === "fail"
  ).length;

  return {
    status:
      failedPolicies > 0 || failedReasoningConstraints > 0
        ? "fail"
        : policyResults.some((result) => result.status === "watch")
          ? "watch"
          : "pass",
    detail:
      failedPolicies > 0 || failedReasoningConstraints > 0
        ? "One or more governance or reasoning constraints prevent unrestricted progression."
        : "Constraint checks are within the allowed governance band.",
  } as const;
}
