import assert from "node:assert/strict";
import {
  aggregateEvaluations,
  compareBaseline,
  createEvaluationRubric,
  scoreEvaluation,
} from "../../src/features/evaluation";

function main(): void {
  const created = createEvaluationRubric({
    rubricId: "rubric", version: "1", passThreshold: 0.7,
    normalization: { minimum: 0, maximum: 1 },
    dimensions: [
      { dimensionId: "numeric", weight: 2, scoring: "numeric" },
      { dimensionId: "category", weight: 1, scoring: "categorical", categories: { good: 1, poor: 0 } },
      { dimensionId: "gate", weight: 1, scoring: "pass-fail" },
    ],
  });
  assert.equal(created.status, "created");
  if (created.status !== "created") return;
  const scored = scoreEvaluation(created.value, {
    numeric: { kind: "numeric", value: 0.8 },
    category: { kind: "categorical", value: "good" },
    gate: { kind: "pass-fail", value: "pass" },
  });
  assert.deepEqual(scored, { status: "scored", normalizedScore: 0.9, passed: true });
  assert.equal(scoreEvaluation(created.value, {}).status, "invalid_scores");

  assert.equal(compareBaseline({ candidate: 0.7, baseline: 0.8, minimum: 0, maximum: 1 })?.classification, "regression");
  assert.equal(compareBaseline({ candidate: 0.9, baseline: 0.8, minimum: 0, maximum: 1 })?.classification, "improvement");
  assert.equal(compareBaseline({ candidate: 0.801, baseline: 0.8, minimum: 0, maximum: 1, unchangedTolerance: 0.01 })?.classification, "unchanged");

  const aggregate = aggregateEvaluations([
    { datasetId: "dataset", evaluatorId: "evaluator", subjectType: "workflow", subjectId: "b", version: "1", normalizedScore: 0.4, outcome: "failed" },
    { datasetId: "dataset", evaluatorId: "evaluator", subjectType: "workflow", subjectId: "a", version: "1", normalizedScore: 0.8, outcome: "passed" },
    { datasetId: "dataset", evaluatorId: "evaluator", subjectType: "workflow", subjectId: "a", version: "1", normalizedScore: 0.6, outcome: "inconclusive" },
  ]);
  assert.equal(aggregate.length, 2);
  assert.equal(aggregate[0]?.subjectId, "a");
  assert.equal(aggregate[0]?.meanScore, 0.7);
  assert.deepEqual({ passed: aggregate[0]?.passed, failed: aggregate[0]?.failed, inconclusive: aggregate[0]?.inconclusive }, { passed: 1, failed: 0, inconclusive: 1 });
  assert.equal(Object.isFrozen(aggregate), true);

  console.log("evaluation scoring, comparison, and aggregation checks passed");
}

main();
