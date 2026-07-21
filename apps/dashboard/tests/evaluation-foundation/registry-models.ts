import assert from "node:assert/strict";
import {
  createEvaluationCase,
  createEvaluationDataset,
  createEvaluationRubric,
  createEvaluationRun,
  EvaluationRegistry,
  type EvaluationRun,
} from "../../src/features/evaluation";

const definition = {
  evaluatorId: "quality-evaluator",
  version: "1.0.0",
  lifecycle: "active",
  compatibility: "backward-compatible",
  compatibleDatasetVersions: ["1.0.0"],
  owner: "evaluation-platform",
} as const;

function main(): void {
  const registry = new EvaluationRegistry([definition]);
  assert.equal(registry.resolve("quality-evaluator", "1.0.0", "1.0.0").status, "resolved");
  assert.equal(registry.resolve("unknown", "1.0.0", "1.0.0").status, "unknown_evaluator");
  assert.equal(registry.resolve("quality-evaluator", "1.0.0", "2.0.0").status, "incompatible");
  assert.equal(Object.isFrozen(registry.list()), true);
  assert.equal(Object.isFrozen(registry.list()[0]), true);
  assert.equal(registry.register(definition).status, "duplicate");
  const registered = registry.register({ ...definition, version: "1.1.0" });
  assert.equal(registered.status, "registered");
  assert.equal(registry.list().length, 1);
  assert.equal(registered.status === "registered" && registered.registry.list().length, 2);

  const evaluationCase = createEvaluationCase({
    caseId: "case-1", version: "1.0.0", inputReference: "evidence://input/1",
    expectedOutcome: { kind: "pass-fail", value: "pass" }, rubricReference: "rubric-1@1.0.0",
    metadata: { domain: "quality", language: "tr" }, tags: ["baseline"],
  });
  assert.equal(evaluationCase.status, "created");
  assert.equal(evaluationCase.status === "created" && Object.isFrozen(evaluationCase.value.tags), true);

  const dataset = createEvaluationDataset({
    datasetId: "dataset-1", version: "1.0.0", caseReferences: ["case-1@1.0.0"],
    owner: "evaluation-platform", lifecycle: "active", compatibility: "backward-compatible",
  });
  assert.equal(dataset.status, "created");
  assert.equal(dataset.status === "created" && "businessData" in dataset.value, false);
  assert.equal(createEvaluationDataset({ ...dataset.status === "created" ? dataset.value : {} as never, businessData: { customer: "embedded" } } as never).status, "invalid");

  const rubric = createEvaluationRubric({
    rubricId: "rubric-1", version: "1.0.0", passThreshold: 0.7,
    normalization: { minimum: 0, maximum: 1 },
    dimensions: [{ dimensionId: "correctness", weight: 1, scoring: "numeric" }],
  });
  assert.equal(rubric.status, "created");
  assert.equal(rubric.status === "created" && Object.isFrozen(rubric.value.dimensions), true);

  const runInput: EvaluationRun = {
    runId: "run-1", evaluatorId: "quality-evaluator", evaluatorVersion: "1.0.0",
    subject: { type: "workflow", id: "workflow-1", version: "2.0.0" },
    dataset: { datasetId: "dataset-1", version: "1.0.0" }, caseReferences: ["case-1@1.0.0"],
    executionMetadata: { environment: "simulation", executionVersion: "1.0.0" },
    evidenceReferences: ["evidence://result/1"], startedAt: "2026-07-21T12:00:00.000Z",
    completedAt: "2026-07-21T12:00:01.000Z", policyVersion: 1, schemaVersion: 1,
  };
  const run = createEvaluationRun(runInput);
  assert.equal(run.status, "created");
  assert.equal(run.status === "created" && Object.isFrozen(run.value.subject), true);
  assert.equal(createEvaluationRun({ ...runInput, hiddenReasoning: "private" } as EvaluationRun).status, "invalid");
  assert.equal(createEvaluationCase({ ...evaluationCase.status === "created" ? evaluationCase.value : {} as never, metadata: { secret: "value" } } as never).status, "invalid");

  console.log("evaluation registry and immutable model checks passed");
}

main();
