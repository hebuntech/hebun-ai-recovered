import assert from "node:assert/strict";
import {
  createEvaluationCase,
  createEvaluationRubric,
  createEvaluationRun,
  evaluateCase,
  EvaluationRegistry,
  type EvaluationEvidenceReader,
  type Evaluator,
} from "../../src/features/evaluation";

const evidenceReader: EvaluationEvidenceReader = {
  async read(reference) {
    return { status: "found", evidence: { reference, completeness: "FULL", value: { result: "ok" } } };
  },
};

async function main(): Promise<void> {
  const registry = new EvaluationRegistry([{
    evaluatorId: "evaluator", version: "1", lifecycle: "active", compatibility: "backward-compatible",
    compatibleDatasetVersions: ["1"], owner: "evaluation",
  }]);
  const evaluationCase = createEvaluationCase({
    caseId: "case", version: "1", inputReference: "evidence-1",
    expectedOutcome: { kind: "numeric", value: 1 }, rubricReference: "rubric@1", metadata: {}, tags: [],
  });
  const rubric = createEvaluationRubric({
    rubricId: "rubric", version: "1", normalization: { minimum: 0, maximum: 1 }, passThreshold: 0.7,
    dimensions: [{ dimensionId: "quality", weight: 1, scoring: "numeric" }],
  });
  const run = createEvaluationRun({
    runId: "run", evaluatorId: "evaluator", evaluatorVersion: "1", subject: { type: "workflow", id: "workflow" },
    dataset: { datasetId: "dataset", version: "1" }, caseReferences: ["case"],
    executionMetadata: { environment: "simulation", executionVersion: "1" }, evidenceReferences: ["evidence-1"],
    startedAt: "2026-07-21T12:00:00.000Z", policyVersion: 1, schemaVersion: 1,
  });
  assert.equal(evaluationCase.status, "created");
  assert.equal(rubric.status, "created");
  assert.equal(run.status, "created");
  if (evaluationCase.status !== "created" || rubric.status !== "created" || run.status !== "created") return;

  const evaluator: Evaluator = {
    evaluatorId: "evaluator", version: "1",
    async evaluate(request) {
      const evidence = await request.evidenceReader.read("evidence-1");
      assert.equal(evidence.status, "found");
      return { status: "evaluated", dimensionScores: { quality: { kind: "numeric", value: 0.9 } }, evidenceCompleteness: "FULL", evidenceReferences: ["evidence-1"] };
    },
  };
  const evaluated = await evaluateCase({ registry, evaluator, run: run.value, evaluationCase: evaluationCase.value, rubric: rubric.value, evidenceReader });
  assert.deepEqual(evaluated, { status: "evaluated", normalizedScore: 0.9, outcome: "passed", evidenceCompleteness: "FULL", evidenceReferences: ["evidence-1"] });

  const missingEvaluator: Evaluator = { ...evaluator, async evaluate() { return { status: "insufficient_evidence", evidenceCompleteness: "MISSING", evidenceReferences: [] }; } };
  assert.equal((await evaluateCase({ registry, evaluator: missingEvaluator, run: run.value, evaluationCase: evaluationCase.value, rubric: rubric.value, evidenceReader })).status, "insufficient_evidence");
  assert.equal((await evaluateCase({ registry: new EvaluationRegistry([]), evaluator, run: run.value, evaluationCase: evaluationCase.value, rubric: rubric.value, evidenceReader })).status, "unknown_evaluator");

  console.log("evaluator execution and fail-closed evidence checks passed");
}

void main();
