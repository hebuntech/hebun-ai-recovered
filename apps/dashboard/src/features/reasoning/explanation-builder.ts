import type {
  CandidateOption,
  ReasoningConstraint,
  ReasoningContext,
  ReasoningEvidence,
  ReasoningExplanation,
  ReasoningGoal,
  ReasoningRecommendation,
} from "@/features/reasoning/types";

export function buildExplanation(
  context: ReasoningContext,
  evidence: ReasoningEvidence[],
  constraints: ReasoningConstraint[],
  goals: ReasoningGoal[],
  selectedOption: CandidateOption,
  recommendation: ReasoningRecommendation
): ReasoningExplanation {
  return {
    summary: `For ${context.title}, the engine recommends "${selectedOption.title}" because it best satisfies the stated goals while staying inside the strongest constraints.`,
    evidenceTrace: evidence.slice(0, 4).map((item) => `${item.title}: ${item.detail}`),
    constraintTrace: constraints.map(
      (constraint) => `${constraint.label} is ${constraint.status} (${constraint.detail})`
    ),
    goalTrace: goals.map(
      (goal) => `${goal.label} is ${goal.status} with alignment ${goal.alignmentScore}`
    ),
    whySelected: [
      recommendation.whyNow,
      `The option keeps traceability across ${selectedOption.relatedRegistryIds.length} registries and ${selectedOption.relatedGraphNodeIds.length} graph nodes.`,
      `The option is backed by ${selectedOption.relatedMemoryIds.length} relevant memory references.`,
    ],
  };
}
