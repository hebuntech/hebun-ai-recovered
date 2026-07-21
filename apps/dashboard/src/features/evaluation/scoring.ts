import type { EvaluationRubric, EvaluationScore } from "./types";

export type EvaluationScoringResult =
  | { readonly status: "scored"; readonly normalizedScore: number; readonly passed: boolean }
  | { readonly status: "invalid_scores"; readonly reason: string };

export interface BaselineComparison {
  readonly candidate: number;
  readonly baseline: number;
  readonly delta: number;
  readonly normalizedDelta: number;
  readonly classification: "regression" | "improvement" | "unchanged";
}

function rawScore(score: EvaluationScore, categories?: Readonly<Record<string, number>>): number | undefined {
  if (score.kind === "numeric") return score.value;
  if (score.kind === "pass-fail") return score.value === "pass" ? 1 : 0;
  return categories?.[score.value];
}

export function scoreEvaluation(
  rubric: EvaluationRubric,
  dimensionScores: Readonly<Record<string, EvaluationScore>>,
): EvaluationScoringResult {
  const weight = rubric.dimensions.reduce((sum, dimension) => sum + dimension.weight, 0);
  let weighted = 0;
  for (const dimension of rubric.dimensions) {
    const score = dimensionScores[dimension.dimensionId];
    if (!score || score.kind !== dimension.scoring) {
      return Object.freeze({ status: "invalid_scores", reason: "MISSING_OR_MISMATCHED_DIMENSION" });
    }
    const raw = rawScore(score, dimension.categories);
    if (raw === undefined || !Number.isFinite(raw)) {
      return Object.freeze({ status: "invalid_scores", reason: "INVALID_DIMENSION_SCORE" });
    }
    const normalized = Math.min(1, Math.max(0, (raw - rubric.normalization.minimum) / (rubric.normalization.maximum - rubric.normalization.minimum)));
    weighted += normalized * dimension.weight;
  }
  const normalizedScore = weighted / weight;
  return Object.freeze({ status: "scored", normalizedScore, passed: normalizedScore >= rubric.passThreshold });
}

export function compareBaseline(input: {
  readonly candidate: number;
  readonly baseline: number;
  readonly minimum: number;
  readonly maximum: number;
  readonly unchangedTolerance?: number;
}): BaselineComparison | undefined {
  if (![input.candidate, input.baseline, input.minimum, input.maximum].every(Number.isFinite) || input.minimum >= input.maximum) return undefined;
  const tolerance = input.unchangedTolerance ?? 0;
  if (!Number.isFinite(tolerance) || tolerance < 0) return undefined;
  const delta = input.candidate - input.baseline;
  const normalizedDelta = delta / (input.maximum - input.minimum);
  return Object.freeze({
    candidate: input.candidate,
    baseline: input.baseline,
    delta,
    normalizedDelta,
    classification: Math.abs(normalizedDelta) <= tolerance ? "unchanged" : normalizedDelta > 0 ? "improvement" : "regression",
  });
}

export interface EvaluationAggregateInput {
  readonly datasetId: string;
  readonly evaluatorId: string;
  readonly subjectType: string;
  readonly subjectId: string;
  readonly version: string;
  readonly normalizedScore: number;
  readonly outcome: "passed" | "failed" | "inconclusive";
}

export interface EvaluationAggregate {
  readonly key: string;
  readonly datasetId: string;
  readonly evaluatorId: string;
  readonly subjectType: string;
  readonly subjectId: string;
  readonly version: string;
  readonly count: number;
  readonly meanScore: number;
  readonly passed: number;
  readonly failed: number;
  readonly inconclusive: number;
}

export function aggregateEvaluations(inputs: readonly EvaluationAggregateInput[]): readonly EvaluationAggregate[] {
  const groups = new Map<string, EvaluationAggregateInput[]>();
  for (const input of inputs) {
    if (!Number.isFinite(input.normalizedScore)) continue;
    const key = [input.datasetId, input.evaluatorId, input.subjectType, input.subjectId, input.version].join("|");
    groups.set(key, [...(groups.get(key) ?? []), input]);
  }
  return Object.freeze([...groups.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([key, values]) => Object.freeze({
    key,
    datasetId: values[0]!.datasetId,
    evaluatorId: values[0]!.evaluatorId,
    subjectType: values[0]!.subjectType,
    subjectId: values[0]!.subjectId,
    version: values[0]!.version,
    count: values.length,
    meanScore: values.reduce((sum, value) => sum + value.normalizedScore, 0) / values.length,
    passed: values.filter(({ outcome }) => outcome === "passed").length,
    failed: values.filter(({ outcome }) => outcome === "failed").length,
    inconclusive: values.filter(({ outcome }) => outcome === "inconclusive").length,
  })));
}
