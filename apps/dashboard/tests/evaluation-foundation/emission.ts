import assert from "node:assert/strict";
import {
  createEvaluationRun,
  emitEvaluationResult,
} from "../../src/features/evaluation";
import {
  canonicalSignalSchemaRegistry,
  createCollectionPipeline,
  createRequestCorrelationContext,
  InMemoryAppendOnlySignalSink,
  type CanonicalSignalType,
  type EvaluationResultPayload,
  type SignalPolicyDecision,
  type SignalPolicyEngine,
} from "../../src/features/observability";

const context = createRequestCorrelationContext({
  tenantScope: { kind: "tenant", tenantId: "tenant-a", resolvedBy: "server" },
  platformScope: { kind: "none" },
  relationships: [{ type: "evaluation-run", id: "run-1", tenantId: "tenant-a" }],
});

const policyEngine: SignalPolicyEngine = {
  evaluate<T extends CanonicalSignalType>(candidate: Parameters<SignalPolicyEngine["evaluate"]>[0]): SignalPolicyDecision<T> {
    return {
      decision: "accept", signalType: candidate.candidateSignalType as T, schemaVersion: 1, policyVersion: 1,
      disposition: "telemetry", retention: "operational", severity: candidate.candidateSeverity,
      tenantScope: candidate.tenantScope, platformScope: candidate.platformScope, maxPayloadBytes: 8_192,
      sampled: true, redactionApplied: true, approvedRoutes: ["telemetry"],
    };
  },
};

async function main(): Promise<void> {
  const run = createEvaluationRun({
    runId: "run-1", evaluatorId: "quality-evaluator", evaluatorVersion: "1.0.0",
    subject: { type: "workflow", id: "workflow-1" }, dataset: { datasetId: "dataset-1", version: "1" },
    caseReferences: ["case-1"], executionMetadata: { environment: "simulation", executionVersion: "1" },
    evidenceReferences: ["evidence-1"], startedAt: "2026-07-21T12:00:00.000Z",
    completedAt: "2026-07-21T12:00:01.000Z", policyVersion: 1, schemaVersion: 1,
  });
  assert.equal(run.status, "created");
  if (run.status !== "created") return;

  const sink = new InMemoryAppendOnlySignalSink({ route: "telemetry", capacity: 10 });
  const emitter = createCollectionPipeline({
    registry: canonicalSignalSchemaRegistry, policyEngine, sinks: new Map([["telemetry", sink]]),
    maxCandidatePayloadBytes: 8_192, maxClockDriftMs: 5_000,
    now: () => new Date("2026-07-21T12:00:02.000Z"),
  });
  const dependencies = { emitter, correlationContext: context, now: () => new Date("2026-07-21T12:00:01.000Z") };
  const emitted = await emitEvaluationResult({
    run: run.value, outcome: "passed", normalizedScore: 0.9, evidenceCompleteness: "FULL",
    evidenceReferences: ["evidence-1"], dependencies,
  });
  assert.equal(emitted.status, "emitted");
  const stored = sink.query({ tenantId: "tenant-a", signalType: "evaluation-result" }, context.tenantScope);
  assert.equal(stored.length, 1);
  const signal = stored[0];
  assert.equal(signal?.signalType, "evaluation-result");
  assert.equal((signal?.payload as EvaluationResultPayload | undefined)?.outcome, "passed");
  assert.equal(signal?.correlation.relationships[0]?.type, "evaluation-run");

  const missing = await emitEvaluationResult({
    run: { ...run.value, runId: "run-2" }, outcome: "passed", evidenceCompleteness: "MISSING",
    evidenceReferences: [], dependencies,
  });
  assert.deepEqual(missing, { status: "not_emitted", reason: "MISSING_EVIDENCE" });
  assert.equal(sink.query({ tenantId: "tenant-a" }, context.tenantScope).length, 1);

  console.log("canonical evaluation result emission checks passed");
}

void main();
