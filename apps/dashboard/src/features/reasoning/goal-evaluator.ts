import type {
  ReasoningContext,
  ReasoningEvidence,
  ReasoningGoal,
} from "@/features/reasoning/types";

export function evaluateGoals(
  context: ReasoningContext,
  evidence: ReasoningEvidence[]
): ReasoningGoal[] {
  const evidenceCount = evidence.length;
  const averageRegistryHealth =
    context.registries.reduce((sum, registry) => sum + registry.health, 0) /
    Math.max(context.registries.length, 1);

  return context.goalLabels.map((goalLabel, index) => {
    const alignmentScore = Math.round(
      Math.max(58, Math.min(96, averageRegistryHealth - index * 2 + evidenceCount))
    );

    return {
      id: `${context.scenarioId}-g${index + 1}`,
      label: goalLabel,
      status: alignmentScore >= 88 ? "aligned" : alignmentScore >= 74 ? "partial" : "blocked",
      alignmentScore,
      detail:
        alignmentScore >= 88
          ? `${goalLabel} is strongly supported by current evidence and the company model.`
          : alignmentScore >= 74
            ? `${goalLabel} is viable, but needs a more conservative option to stay inside control limits.`
            : `${goalLabel} is currently blocked by weak evidence, low health, or high control pressure.`,
    };
  });
}
