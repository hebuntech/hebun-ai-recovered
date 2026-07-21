import assert from "node:assert/strict";
import {
  createCanonicalSignal,
  SignalContractError,
  type CanonicalSignalType,
  type NormalizedSignalCandidate,
  type SignalPolicyDecision,
} from "../../src/features/observability";

function expectMissingRejected(
  signalType: CanonicalSignalType,
  payload: unknown,
): void {
  const tenantScope = { kind: "tenant", tenantId: "tenant-a", resolvedBy: "server" } as const;
  const platformScope = { kind: "none" } as const;
  const candidate: NormalizedSignalCandidate = {
    signalId: `missing-${signalType}`,
    candidateSignalType: signalType,
    schemaVersion: 1,
    producer: { id: "test", producerClass: "evaluation", version: "1" },
    source: { component: "test", operation: "missing-evidence" },
    timestamp: "2026-07-21T12:00:00.000Z",
    tenantScope,
    platformScope,
    correlation: { relationships: [] },
    candidateSeverity: "info",
    payload,
    metadata: {},
    evidenceCompleteness: "MISSING",
  };
  const decision: SignalPolicyDecision = {
    decision: "accept",
    signalType,
    schemaVersion: 1,
    policyVersion: 1,
    disposition: "telemetry",
    retention: "operational",
    severity: "warning",
    tenantScope,
    platformScope,
    maxPayloadBytes: 8_192,
    sampled: true,
    redactionApplied: true,
    approvedRoutes: ["telemetry"],
  };
  assert.throws(
    () => createCanonicalSignal({ candidate, policyDecision: decision, receivedAt: new Date("2026-07-21T12:00:01.000Z"), maxClockDriftMs: 5_000 }),
    (error: unknown) => error instanceof SignalContractError && error.code === "INVALID_PAYLOAD",
  );
}

function main(): void {
  expectMissingRejected("evaluation-result", {
    evaluationRunId: "run-1", evaluatorId: "evaluator", evaluatorVersion: "1", subjectType: "workflow", subjectId: "workflow-1", outcome: "passed", evidenceReferences: [],
  });
  expectMissingRejected("health-signal", {
    subjectType: "workflow", subjectId: "workflow-1", dimension: "availability", state: "healthy", evidenceReferences: [], derivationVersion: "1",
  });
  expectMissingRejected("operational-event", {
    name: "operation", component: "runtime", outcome: "succeeded",
  });
  console.log("signal evidence completeness checks passed");
}

main();
