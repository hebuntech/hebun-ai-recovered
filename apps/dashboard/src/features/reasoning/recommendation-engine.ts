import type {
  CandidateOption,
  OptionTradeoff,
  ReasoningRecommendation,
  ReasoningRiskLevel,
} from "@/features/reasoning/types";

export function produceRecommendation(
  option: CandidateOption,
  tradeoff: OptionTradeoff | undefined,
  riskLevel: ReasoningRiskLevel
): ReasoningRecommendation {
  return {
    title: option.title,
    summary: option.summary,
    nextStep: option.actions[0],
    whyNow:
      riskLevel === "critical" || riskLevel === "high"
        ? `Current evidence and trade-off scoring favor immediate stabilization because the risk posture is ${riskLevel}.`
        : `Current evidence supports moving on this option now because it preserves explainability while keeping progress moving.`,
  };
}
