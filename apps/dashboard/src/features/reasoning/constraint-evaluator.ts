import type {
  ReasoningConstraint,
  ReasoningContext,
  ReasoningEvidence,
} from "@/features/reasoning/types";

export function evaluateConstraints(
  context: ReasoningContext,
  evidence: ReasoningEvidence[]
): ReasoningConstraint[] {
  const averageHealth =
    context.registries.reduce((sum, registry) => sum + registry.health, 0) /
    Math.max(context.registries.length, 1);
  const evidenceWeight =
    evidence.reduce((sum, item) => sum + item.weight, 0) / Math.max(evidence.length, 1);

  return [
    {
      id: `${context.scenarioId}-c1`,
      label: "Preserve governance and control explainability",
      status: averageHealth < 92 ? "fail" : averageHealth < 95 ? "watch" : "pass",
      detail: "Recommendations cannot weaken governance traceability or reduce explainability coverage.",
      scoreImpact: averageHealth < 92 ? -18 : averageHealth < 95 ? -8 : 3,
    },
    {
      id: `${context.scenarioId}-c2`,
      label: "Use only referenced company data",
      status: evidence.some((item) => item.sourceType === "memory") ? "pass" : "watch",
      detail: "The engine should rely on registries, graph links, and memory references rather than inventing unsupported context.",
      scoreImpact: evidence.some((item) => item.sourceType === "memory") ? 4 : -6,
    },
    {
      id: `${context.scenarioId}-c3`,
      label: "Avoid high-risk expansion before stability improves",
      status: evidenceWeight >= 82 ? "watch" : "pass",
      detail: "When evidence indicates higher risk or instability, the selected option should favor stabilization over acceleration.",
      scoreImpact: evidenceWeight >= 90 ? -12 : evidenceWeight >= 82 ? -6 : 5,
    },
  ];
}
