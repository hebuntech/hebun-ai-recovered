import type {
  CandidateOption,
  OptionTradeoff,
  ReasoningConstraint,
  ReasoningGoal,
} from "@/features/reasoning/types";

export function analyzeTradeoffs(
  options: CandidateOption[],
  constraints: ReasoningConstraint[],
  goals: ReasoningGoal[]
): OptionTradeoff[] {
  const failedConstraints = constraints.filter((constraint) => constraint.status === "fail").length;
  const watchConstraints = constraints.filter((constraint) => constraint.status === "watch").length;
  const alignedGoals = goals.filter((goal) => goal.status === "aligned").length;
  const partialGoals = goals.filter((goal) => goal.status === "partial").length;

  return options.map((option) => {
    const upsideScore =
      option.title === "Balanced improvement path"
        ? 86 + alignedGoals
        : option.title === "Stabilize before expanding"
          ? 82 + partialGoals
          : 72 + alignedGoals;
    const costScore =
      option.title === "Stabilize before expanding"
        ? 64
        : option.title === "Balanced improvement path"
          ? 56
          : 42;
    const riskScore =
      option.title === "Accelerate with monitoring"
        ? 82 + failedConstraints * 4
        : option.title === "Balanced improvement path"
          ? 58 + watchConstraints * 2
          : 44 + watchConstraints;
    const speedScore =
      option.title === "Accelerate with monitoring"
        ? 90
        : option.title === "Balanced improvement path"
          ? 72
          : 56;
    const totalScore = Math.round(upsideScore * 0.45 + speedScore * 0.2 - riskScore * 0.25 - costScore * 0.1 + 40);

    return {
      optionId: option.id,
      upsideScore,
      costScore,
      riskScore,
      speedScore,
      totalScore,
      summary:
        option.title === "Balanced improvement path"
          ? "Best balance between explainability, throughput, and risk control."
          : option.title === "Stabilize before expanding"
            ? "Safest option, but slower operationally."
            : "Fastest option, but least defensible under current evidence.",
    };
  }).sort((a, b) => b.totalScore - a.totalScore);
}
