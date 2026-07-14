import type {
  CandidateOption,
  ReasoningContext,
  ReasoningConstraint,
  ReasoningEvidence,
  ReasoningGoal,
} from "@/features/reasoning/types";

function relatedMemoryIds(evidence: ReasoningEvidence[]) {
  return Array.from(new Set(evidence.flatMap((item) => item.memoryIds))).slice(0, 4);
}

function relatedNodeIds(evidence: ReasoningEvidence[]) {
  return Array.from(new Set(evidence.flatMap((item) => item.graphNodeIds))).slice(0, 6);
}

export function generateCandidateOptions(
  context: ReasoningContext,
  evidence: ReasoningEvidence[],
  constraints: ReasoningConstraint[],
  goals: ReasoningGoal[]
): CandidateOption[] {
  const memoryIds = relatedMemoryIds(evidence);
  const graphNodeIds = relatedNodeIds(evidence);
  const blockedGoals = goals.filter((goal) => goal.status === "blocked").length;
  const failedConstraints = constraints.filter((constraint) => constraint.status === "fail").length;

  return [
    {
      id: `${context.scenarioId}-opt-1`,
      title: "Stabilize before expanding",
      summary: "Prioritize control, coverage, and evidence quality before allowing broader operational change.",
      actions: [
        "Raise validation and coverage thresholds on the focused registries",
        "Pause any expansion path that depends on weak evidence",
        "Add director watch rules for the affected surfaces",
      ],
      benefits: [
        "Highest traceability and control confidence",
        "Reduces the chance of hidden drift",
      ],
      downsides: [
        "Slower short-term throughput",
        blockedGoals > 0 ? "Some strategic goals will advance more slowly" : "May feel conservative to operators",
      ],
      relatedRegistryIds: context.registryIds,
      relatedGraphNodeIds: graphNodeIds,
      relatedMemoryIds: memoryIds,
    },
    {
      id: `${context.scenarioId}-opt-2`,
      title: "Balanced improvement path",
      summary: "Improve the weak points first, but keep essential operating throughput moving under tighter controls.",
      actions: [
        "Strengthen the weakest registries without stopping all downstream work",
        "Route only high-risk cases through extra review",
        "Use memory and graph evidence as the gating layer for prioritization",
      ],
      benefits: [
        "Preserves execution momentum",
        "Keeps recommendations explainable",
      ],
      downsides: [
        failedConstraints > 0 ? "Requires careful guardrails to stay within constraints" : "Still needs close monitoring",
        "More operational coordination than the stabilize option",
      ],
      relatedRegistryIds: context.registryIds,
      relatedGraphNodeIds: graphNodeIds,
      relatedMemoryIds: memoryIds,
    },
    {
      id: `${context.scenarioId}-opt-3`,
      title: "Accelerate with monitoring",
      summary: "Continue expanding while relying on monitoring to catch problems later.",
      actions: [
        "Keep current thresholds and expand usage quickly",
        "Treat monitoring as the primary safeguard",
        "Review failures after scale signals appear",
      ],
      benefits: [
        "Fastest short-term throughput",
        "Lowest immediate friction",
      ],
      downsides: [
        "Weakest explainability posture",
        "Highest chance of compounding hidden issues",
      ],
      relatedRegistryIds: context.registryIds,
      relatedGraphNodeIds: graphNodeIds,
      relatedMemoryIds: memoryIds,
    },
  ];
}
