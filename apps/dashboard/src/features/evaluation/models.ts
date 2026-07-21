import type {
  EvaluationCase,
  EvaluationDataset,
  EvaluationFactoryResult,
  EvaluationRubric,
  EvaluationRun,
  EvaluationScore,
} from "./types";
import { deepFreeze, hasOnlyKeys, isSafeEvaluationValue, validText, validVersion } from "./validation";

function created<T>(value: T): EvaluationFactoryResult<T> {
  return Object.freeze({ status: "created", value: deepFreeze(value) });
}

function invalid<T>(reason: string): EvaluationFactoryResult<T> {
  return Object.freeze({ status: "invalid", reason });
}

function validScore(score: EvaluationScore): boolean {
  return score.kind === "numeric"
    ? Number.isFinite(score.value)
    : validText(score.value);
}

export function createEvaluationCase(input: EvaluationCase): EvaluationFactoryResult<EvaluationCase> {
  if (!hasOnlyKeys(input, ["caseId", "version", "inputReference", "expectedOutcome", "rubricReference", "metadata", "tags"]) ||
      !hasOnlyKeys(input.metadata, ["domain", "language", "difficulty"]) || !isSafeEvaluationValue(input) ||
      !validText(input.caseId) || !validVersion(input.version) || !validText(input.inputReference) ||
      !validText(input.rubricReference) || !validScore(input.expectedOutcome) ||
      !isSafeEvaluationValue(input.metadata) || input.tags.some((tag) => !validText(tag))) {
    return invalid("INVALID_EVALUATION_CASE");
  }
  return created({ ...input, expectedOutcome: { ...input.expectedOutcome }, metadata: { ...input.metadata }, tags: [...input.tags] });
}

export function createEvaluationDataset(input: EvaluationDataset): EvaluationFactoryResult<EvaluationDataset> {
  if (!hasOnlyKeys(input, ["datasetId", "version", "caseReferences", "owner", "lifecycle", "compatibility"]) ||
      !isSafeEvaluationValue(input) || !validText(input.datasetId) || !validVersion(input.version) || !validText(input.owner) ||
      input.caseReferences.length === 0 || input.caseReferences.some((reference) => !validText(reference)) ||
      new Set(input.caseReferences).size !== input.caseReferences.length) {
    return invalid("INVALID_DATASET");
  }
  return created({ ...input, caseReferences: [...input.caseReferences] });
}

export function createEvaluationRubric(input: EvaluationRubric): EvaluationFactoryResult<EvaluationRubric> {
  const { minimum, maximum } = input.normalization;
  const dimensionIds = input.dimensions.map(({ dimensionId }) => dimensionId);
  if (!hasOnlyKeys(input, ["rubricId", "version", "dimensions", "normalization", "passThreshold"]) ||
      !hasOnlyKeys(input.normalization, ["minimum", "maximum"]) || !isSafeEvaluationValue(input) ||
      !validText(input.rubricId) || !validVersion(input.version) || input.dimensions.length === 0 ||
      new Set(dimensionIds).size !== dimensionIds.length ||
      input.dimensions.some((dimension) => !hasOnlyKeys(dimension, ["dimensionId", "weight", "scoring", "categories"]) || !validText(dimension.dimensionId) || !Number.isFinite(dimension.weight) || dimension.weight <= 0 ||
        (dimension.scoring === "categorical" && (!dimension.categories || Object.values(dimension.categories).some((score) => !Number.isFinite(score))))) ||
      !Number.isFinite(minimum) || !Number.isFinite(maximum) || minimum >= maximum ||
      !Number.isFinite(input.passThreshold) || input.passThreshold < 0 || input.passThreshold > 1) {
    return invalid("INVALID_RUBRIC");
  }
  return created({
    ...input,
    dimensions: input.dimensions.map((dimension) => ({ ...dimension, categories: dimension.categories ? { ...dimension.categories } : undefined })),
    normalization: { ...input.normalization },
  });
}

export function createEvaluationRun(input: EvaluationRun): EvaluationFactoryResult<EvaluationRun> {
  const started = Date.parse(input.startedAt);
  const completed = input.completedAt ? Date.parse(input.completedAt) : undefined;
  if (!hasOnlyKeys(input, ["runId", "evaluatorId", "evaluatorVersion", "subject", "dataset", "caseReferences", "executionMetadata", "evidenceReferences", "startedAt", "completedAt", "policyVersion", "schemaVersion"]) ||
      !hasOnlyKeys(input.subject, ["type", "id", "version"]) || !hasOnlyKeys(input.dataset, ["datasetId", "version"]) ||
      !hasOnlyKeys(input.executionMetadata, ["environment", "executionVersion"]) ||
      !validText(input.runId) || !validText(input.evaluatorId) || !validVersion(input.evaluatorVersion) ||
      !validText(input.subject.type) || !validText(input.subject.id) || !validText(input.dataset.datasetId) || !validVersion(input.dataset.version) ||
      input.caseReferences.length === 0 || input.evidenceReferences.some((reference) => !validText(reference)) ||
      !Number.isFinite(started) || (completed !== undefined && (!Number.isFinite(completed) || completed < started)) ||
      !Number.isSafeInteger(input.policyVersion) || input.policyVersion <= 0 || !Number.isSafeInteger(input.schemaVersion) || input.schemaVersion <= 0 ||
      !isSafeEvaluationValue(input)) {
    return invalid("INVALID_EVALUATION_RUN");
  }
  return created({
    ...input,
    subject: { ...input.subject }, dataset: { ...input.dataset }, caseReferences: [...input.caseReferences],
    executionMetadata: { ...input.executionMetadata }, evidenceReferences: [...input.evidenceReferences],
  });
}
