import type {
  CollectionResult,
  EvidenceCompleteness,
  RequestCorrelationContext,
  SignalEmitter,
} from "../observability";

export type EvaluationLifecycle = "active" | "deprecated" | "retired";
export type EvaluationCompatibility = "backward-compatible" | "breaking";
export type EvaluationScore =
  | { readonly kind: "numeric"; readonly value: number }
  | { readonly kind: "categorical"; readonly value: string }
  | { readonly kind: "pass-fail"; readonly value: "pass" | "fail" };

export interface EvaluatorDefinition {
  readonly evaluatorId: string;
  readonly version: string;
  readonly lifecycle: EvaluationLifecycle;
  readonly compatibility: EvaluationCompatibility;
  readonly compatibleDatasetVersions: readonly string[];
  readonly owner: string;
}

export interface EvaluationCase {
  readonly caseId: string;
  readonly version: string;
  readonly inputReference: string;
  readonly expectedOutcome: EvaluationScore;
  readonly rubricReference: string;
  readonly metadata: {
    readonly domain?: string;
    readonly language?: string;
    readonly difficulty?: "basic" | "intermediate" | "advanced";
  };
  readonly tags: readonly string[];
}

export interface EvaluationDataset {
  readonly datasetId: string;
  readonly version: string;
  readonly caseReferences: readonly string[];
  readonly owner: string;
  readonly lifecycle: EvaluationLifecycle;
  readonly compatibility: EvaluationCompatibility;
}

export interface RubricDimension {
  readonly dimensionId: string;
  readonly weight: number;
  readonly scoring: "numeric" | "categorical" | "pass-fail";
  readonly categories?: Readonly<Record<string, number>>;
}

export interface EvaluationRubric {
  readonly rubricId: string;
  readonly version: string;
  readonly dimensions: readonly RubricDimension[];
  readonly normalization: { readonly minimum: number; readonly maximum: number };
  readonly passThreshold: number;
}

export interface EvaluationRun {
  readonly runId: string;
  readonly evaluatorId: string;
  readonly evaluatorVersion: string;
  readonly subject: { readonly type: string; readonly id: string; readonly version?: string };
  readonly dataset: { readonly datasetId: string; readonly version: string };
  readonly caseReferences: readonly string[];
  readonly executionMetadata: {
    readonly environment: "simulation" | "dry-run" | "live";
    readonly executionVersion: string;
  };
  readonly evidenceReferences: readonly string[];
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly policyVersion: number;
  readonly schemaVersion: number;
}

export interface EvaluationEvidence {
  readonly reference: string;
  readonly completeness: EvidenceCompleteness;
  readonly value: unknown;
}

export interface EvaluationEvidenceReader {
  read(reference: string): Promise<
    | { readonly status: "found"; readonly evidence: EvaluationEvidence }
    | { readonly status: "not_found"; readonly reference: string }
  >;
}

export interface EvaluationRequest {
  readonly run: EvaluationRun;
  readonly evaluationCase: EvaluationCase;
  readonly rubric: EvaluationRubric;
  readonly evidenceReader: EvaluationEvidenceReader;
}

export type EvaluatorResult =
  | { readonly status: "evaluated"; readonly dimensionScores: Readonly<Record<string, EvaluationScore>>; readonly evidenceCompleteness: EvidenceCompleteness; readonly evidenceReferences: readonly string[] }
  | { readonly status: "insufficient_evidence"; readonly evidenceCompleteness: "UNKNOWN" | "MISSING"; readonly evidenceReferences: readonly string[] }
  | { readonly status: "rejected"; readonly reason: string };

export interface Evaluator {
  readonly evaluatorId: string;
  readonly version: string;
  evaluate(request: EvaluationRequest): Promise<EvaluatorResult>;
}

export interface EvaluationSignalDependencies {
  readonly emitter: SignalEmitter;
  readonly correlationContext: RequestCorrelationContext;
  readonly now: () => Date;
}

export type EvaluationExecutionResult =
  | { readonly status: "evaluated"; readonly normalizedScore: number; readonly outcome: "passed" | "failed"; readonly evidenceCompleteness: "FULL" | "PARTIAL"; readonly evidenceReferences: readonly string[] }
  | { readonly status: "unknown_evaluator" | "incompatible_evaluator" | "evaluator_mismatch" | "invalid_scores"; readonly reason: string }
  | { readonly status: "insufficient_evidence"; readonly evidenceCompleteness: "UNKNOWN" | "MISSING"; readonly evidenceReferences: readonly string[] }
  | { readonly status: "rejected"; readonly reason: string };

export type EvaluationSignalResult =
  | { readonly status: "emitted"; readonly collection: Extract<CollectionResult, { status: "accepted" }> }
  | { readonly status: "not_emitted"; readonly reason: "MISSING_EVIDENCE" | "INVALID_RESULT"; readonly collection?: CollectionResult };

export type EvaluationFactoryResult<T> =
  | { readonly status: "created"; readonly value: T }
  | { readonly status: "invalid"; readonly reason: string };
