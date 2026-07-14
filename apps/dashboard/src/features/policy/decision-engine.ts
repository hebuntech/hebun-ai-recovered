import { allowedReasoningActions, blockedReasoningActions } from "@/features/policy/rule-engine";
import type {
  ApprovalRequirement,
  ComplianceResult,
  GovernanceDecision,
  PermissionResult,
  PolicyResult,
  PolicyRiskAssessment,
} from "@/features/policy/types";
import type { ReasoningResult } from "@/features/reasoning";

export function generateGovernanceDecision(
  reasoning: ReasoningResult,
  policyResults: PolicyResult[],
  permissionResults: PermissionResult[],
  complianceResults: ComplianceResult[],
  riskAssessment: PolicyRiskAssessment,
  approvalRequirements: ApprovalRequirement[]
) {
  const hasFail =
    policyResults.some((item) => item.status === "fail") ||
    permissionResults.some((item) => item.status === "fail") ||
    complianceResults.some((item) => item.status === "fail");
  const hasWatch =
    policyResults.some((item) => item.status === "watch") ||
    permissionResults.some((item) => item.status === "watch") ||
    complianceResults.some((item) => item.status === "watch");

  const governanceDecision: GovernanceDecision = hasFail
    ? {
        status: "blocked",
        summary: "The reasoning result cannot progress to planning yet.",
        rationale: "At least one policy, permission, or compliance control blocks progression.",
      }
    : approvalRequirements.some((item) => item.mode !== "none") || hasWatch
      ? {
          status: "approval-required",
          summary: "The reasoning result is conditionally allowed but requires explicit governance approval.",
          rationale: "The recommendation is viable only after the required review and authorization path completes.",
        }
      : {
          status: "allow",
          summary: "The reasoning result is allowed to progress to planning review.",
          rationale: "The recommendation clears the applicable policies, permissions, and compliance thresholds.",
        };

  return {
    governanceDecision,
    allowedActions: allowedReasoningActions(reasoning),
    blockedActions:
      governanceDecision.status === "allow"
        ? []
        : blockedReasoningActions(reasoning),
    requiredApprovals: approvalRequirements.map((item) => item.mode),
  };
}
