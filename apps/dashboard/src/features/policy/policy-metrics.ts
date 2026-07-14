import { governanceMetrics } from "@/features/governance/metrics";
import { governanceResults } from "@/features/policy/governance-pipeline";
import { latestGovernanceResult } from "@/features/policy/policy-queries";
import type { PolicyMetrics } from "@/features/policy/types";

const blockedDecisions = governanceResults.filter(
  (result) => result.governanceDecision.status === "blocked"
).length;
const highRiskDecisions = governanceResults.filter(
  (result) =>
    result.riskAssessment.level === "high" || result.riskAssessment.level === "critical"
).length;
const averageConfidence = Math.round(
  governanceResults.reduce((sum, result) => sum + result.confidence, 0) /
    Math.max(governanceResults.length, 1)
);
const health = Math.round(
  governanceMetrics.health * 0.4 +
    governanceMetrics.complianceScore * 0.25 +
    averageConfidence * 0.2 -
    blockedDecisions * 3 -
    highRiskDecisions * 2
);

export const policyMetrics: PolicyMetrics = {
  policyHealth: Math.max(0, Math.min(100, health)),
  complianceScore: governanceMetrics.complianceScore,
  openApprovals: governanceMetrics.pendingApprovals,
  blockedDecisions,
  highRiskDecisions,
  auditStatus: blockedDecisions === 0 ? "clear" : "attention",
  latestDecision: latestGovernanceResult()?.governanceDecision.summary ?? "No decision",
  averageConfidence,
  healthBadge:
    health >= 90 ? "success" : health >= 82 ? "warning" : "error",
};
