import type {
  ReasoningConstraint,
  ReasoningEvidence,
  ReasoningGoal,
  OptionTradeoff,
  ReasoningRiskLevel,
} from "@/features/reasoning/types";

export function scoreConfidence(
  evidence: ReasoningEvidence[],
  constraints: ReasoningConstraint[],
  goals: ReasoningGoal[],
  tradeoffs: OptionTradeoff[]
) {
  const averageEvidenceWeight =
    evidence.reduce((sum, item) => sum + item.weight, 0) / Math.max(evidence.length, 1);
  const passCount = constraints.filter((constraint) => constraint.status === "pass").length;
  const failCount = constraints.filter((constraint) => constraint.status === "fail").length;
  const alignedGoals = goals.filter((goal) => goal.status === "aligned").length;
  const margin =
    (tradeoffs[0]?.totalScore ?? 0) - (tradeoffs[1]?.totalScore ?? tradeoffs[0]?.totalScore ?? 0);

  const confidenceScore = Math.round(
    Math.max(
      58,
      Math.min(
        97,
        averageEvidenceWeight * 0.35 +
          passCount * 7 +
          alignedGoals * 6 -
          failCount * 9 +
          margin * 0.45
      )
    )
  );

  const riskLevel: ReasoningRiskLevel =
    failCount >= 2 || confidenceScore < 68
      ? "critical"
      : failCount >= 1 || confidenceScore < 76
        ? "high"
        : confidenceScore < 86
          ? "medium"
          : "low";

  return { confidenceScore, riskLevel };
}
