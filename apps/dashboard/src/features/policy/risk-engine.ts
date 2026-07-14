import { governanceRisks } from "@/features/governance/risk";
import type { PolicyRiskAssessment } from "@/features/policy/types";
import type { ReasoningResult } from "@/features/reasoning";

export function evaluateOrganizationalRisk(reasoning: ReasoningResult): PolicyRiskAssessment {
  const linkedRisks = governanceRisks.filter((risk) =>
    reasoning.relatedRegistryIds.some((registryId) =>
      risk.mitigation.toLowerCase().includes(registryId.slice(0, 4))
    )
  );
  const critical = governanceRisks.filter((risk) => risk.severity === "critical").length;

  const level =
    reasoning.riskLevel === "critical" || critical > 0
      ? "critical"
      : reasoning.riskLevel === "high"
        ? "high"
        : reasoning.riskLevel === "medium"
          ? "medium"
          : "low";

  return {
    level,
    detail:
      level === "critical"
        ? "The recommendation intersects with governance conditions that require executive or human control before progression."
        : level === "high"
          ? "The recommendation is viable only if risk mitigations and review controls remain active."
          : level === "medium"
            ? "The recommendation is acceptable with normal governance monitoring."
            : "The recommendation sits within the low-risk operating band.",
    drivers: [
      `Reasoning risk level: ${reasoning.riskLevel}`,
      `${governanceRisks.length} governance risk records considered`,
      `${linkedRisks.length} risks loosely related to this reasoning context`,
    ],
  };
}
