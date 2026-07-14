/*
 * Agent Reasoning — option generation.
 *
 * Generates a fixed catalog of decision options and scores each deterministically
 * from confidence, risk, and constraint completeness. No AI, no randomness. The
 * catalog order also serves as the tie-break for the recommendation.
 */

import type {
  ConfidenceResult,
  ConstraintAnalysis,
  ReasoningOption,
  ReasoningOptionId,
  RiskAnalysis,
} from "./types";

interface OptionInputs {
  confidence: ConfidenceResult;
  risk: RiskAnalysis;
  constraints: ConstraintAnalysis;
}

/** Catalog order = deterministic tie-break order for the recommendation. */
const CATALOG: { id: ReasoningOptionId; label: string }[] = [
  { id: "proceed", label: "Proceed" },
  { id: "escalate", label: "Escalate" },
  { id: "request-approval", label: "Request Approval" },
  { id: "collect-more-information", label: "Collect More Information" },
  { id: "reject", label: "Reject" },
];

export function generateOptions(inputs: OptionInputs): ReasoningOption[] {
  const conf = inputs.confidence.score;
  const risk = inputs.risk.overallRisk;
  const policyRisk = inputs.risk.policyRisk;
  const completeness = inputs.constraints.completeness; // 0-1
  const missingCount = inputs.constraints.missingInformation.length;
  const incompleteness = (1 - completeness) * 100;

  const scores: Record<ReasoningOptionId, number> = {
    proceed: clamp(conf * 0.6 + (100 - risk) * 0.4 - missingCount * 8),
    escalate: clamp(risk * 0.6 + policyRisk * 0.4),
    "request-approval": clamp(policyRisk * 0.5 + conf * 0.25 + incompleteness * 0.25),
    "collect-more-information": clamp(incompleteness * 0.6 + (100 - conf) * 0.4),
    reject: clamp((100 - conf) * 0.5 + risk * 0.5 - 20),
  };

  const rationales: Record<ReasoningOptionId, string> = {
    proceed: `Confidence ${conf} with risk ${risk}; act within existing constraints`,
    escalate: `Risk ${risk} and policy risk ${policyRisk} warrant escalation`,
    "request-approval": `Policy exposure ${policyRisk}; seek approval before acting`,
    "collect-more-information": `${missingCount} information gap(s); gather more context first`,
    reject: `Low confidence ${conf} with high risk ${risk}; decline to act`,
  };

  return CATALOG.map(({ id, label }) => ({
    id,
    label,
    rationale: rationales[id],
    score: round(scores[id]),
    eligible: scores[id] > 0,
  }));
}

/**
 * Recommend the highest-scoring option. Ties break by catalog order (already the
 * array order), so identical inputs always yield the same recommendation.
 */
export function recommendOption(options: ReasoningOption[]): ReasoningOption {
  let best = options[0];
  for (const option of options) {
    if (option.score > best.score) best = option;
  }
  return best;
}

function clamp(value: number): number {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
