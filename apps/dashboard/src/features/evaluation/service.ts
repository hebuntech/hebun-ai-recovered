import type { ProducerObservation } from "../observability";
import type {
  EvaluationCase,
  EvaluationExecutionResult,
  EvaluationRubric,
  EvaluationRun,
  EvaluationSignalDependencies,
  EvaluationSignalResult,
  Evaluator,
} from "./types";
import type { EvaluationRegistry } from "./registry";
import { scoreEvaluation } from "./scoring";

export async function evaluateCase(input: {
  readonly registry: EvaluationRegistry;
  readonly evaluator: Evaluator;
  readonly run: EvaluationRun;
  readonly evaluationCase: EvaluationCase;
  readonly rubric: EvaluationRubric;
  readonly evidenceReader: Parameters<Evaluator["evaluate"]>[0]["evidenceReader"];
}): Promise<EvaluationExecutionResult> {
  const resolution = input.registry.resolve(input.run.evaluatorId, input.run.evaluatorVersion, input.run.dataset.version);
  if (resolution.status === "unknown_evaluator") return Object.freeze({ status: "unknown_evaluator", reason: "UNKNOWN_EVALUATOR" });
  if (resolution.status === "incompatible") return Object.freeze({ status: "incompatible_evaluator", reason: "INCOMPATIBLE_DATASET_VERSION" });
  if (input.evaluator.evaluatorId !== input.run.evaluatorId || input.evaluator.version !== input.run.evaluatorVersion) {
    return Object.freeze({ status: "evaluator_mismatch", reason: "EVALUATOR_IDENTITY_MISMATCH" });
  }
  const evaluated = await input.evaluator.evaluate({
    run: input.run,
    evaluationCase: input.evaluationCase,
    rubric: input.rubric,
    evidenceReader: input.evidenceReader,
  });
  if (evaluated.status === "rejected") return Object.freeze({ status: "rejected", reason: evaluated.reason });
  if (evaluated.status === "insufficient_evidence") {
    return Object.freeze({ status: "insufficient_evidence", evidenceCompleteness: evaluated.evidenceCompleteness, evidenceReferences: [...evaluated.evidenceReferences] });
  }
  if (evaluated.evidenceCompleteness === "UNKNOWN" || evaluated.evidenceCompleteness === "MISSING") {
    return Object.freeze({ status: "insufficient_evidence", evidenceCompleteness: evaluated.evidenceCompleteness, evidenceReferences: [...evaluated.evidenceReferences] });
  }
  const scoring = scoreEvaluation(input.rubric, evaluated.dimensionScores);
  if (scoring.status === "invalid_scores") return Object.freeze({ status: "invalid_scores", reason: scoring.reason });
  return Object.freeze({
    status: "evaluated",
    normalizedScore: scoring.normalizedScore,
    outcome: scoring.passed ? "passed" : "failed",
    evidenceCompleteness: evaluated.evidenceCompleteness,
    evidenceReferences: Object.freeze([...evaluated.evidenceReferences]),
  });
}

export async function emitEvaluationResult(input: {
  readonly run: EvaluationRun;
  readonly outcome: "passed" | "failed" | "inconclusive";
  readonly normalizedScore?: number;
  readonly evidenceCompleteness: "FULL" | "PARTIAL" | "UNKNOWN" | "MISSING";
  readonly evidenceReferences: readonly string[];
  readonly dependencies: EvaluationSignalDependencies;
}): Promise<EvaluationSignalResult> {
  if (input.evidenceCompleteness === "MISSING" && input.outcome === "passed") {
    return Object.freeze({ status: "not_emitted", reason: "MISSING_EVIDENCE" });
  }
  if (input.normalizedScore !== undefined && (!Number.isFinite(input.normalizedScore) || input.normalizedScore < 0 || input.normalizedScore > 1)) {
    return Object.freeze({ status: "not_emitted", reason: "INVALID_RESULT" });
  }
  const tenantScope = input.dependencies.correlationContext.tenantScope;
  const platformScope = input.dependencies.correlationContext.platformScope;
  const observation: ProducerObservation = {
    signalId: `evaluation-result-${input.run.runId}`,
    signalType: "evaluation-result",
    schemaVersion: input.run.schemaVersion,
    producer: { id: input.run.evaluatorId, producerClass: "evaluation", version: input.run.evaluatorVersion },
    source: { component: "evaluation", operation: "evaluate" },
    timestamp: input.dependencies.now().toISOString(),
    tenantIdCandidate: tenantScope.kind === "tenant" ? tenantScope.tenantId : undefined,
    platformAuthorityCandidate: platformScope.kind === "platform" ? platformScope.authority : undefined,
    correlationCandidates: input.dependencies.correlationContext.relationships.filter(({ type }) => type === "evaluation-run").map(({ type, id, tenantId, parentId }) => ({ type, id, tenantId, parentId })),
    severityCandidate: input.outcome === "failed" ? "warning" : "info",
    payload: {
      evaluationRunId: input.run.runId,
      evaluatorId: input.run.evaluatorId,
      evaluatorVersion: input.run.evaluatorVersion,
      subjectType: input.run.subject.type,
      subjectId: input.run.subject.id,
      outcome: input.outcome,
      ...(input.normalizedScore === undefined ? {} : { score: input.normalizedScore }),
      evidenceReferences: [...input.evidenceReferences],
    },
    metadata: { environment: input.run.executionMetadata.environment },
    evidenceCompleteness: input.evidenceCompleteness,
  };
  const collection = await input.dependencies.emitter.submit(observation, input.dependencies.correlationContext);
  return collection.status === "accepted"
    ? Object.freeze({ status: "emitted", collection })
    : Object.freeze({ status: "not_emitted", reason: "INVALID_RESULT", collection });
}
