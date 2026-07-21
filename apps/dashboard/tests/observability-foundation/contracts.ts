import assert from "node:assert/strict";
import {
  createCanonicalSignal,
  type CanonicalSignalMetadata,
  type NormalizedSignalCandidate,
  type SignalPolicyDecision,
} from "../../src/features/observability";

const candidate: NormalizedSignalCandidate<"metric"> = {
  signalId: "signal-1",
  candidateSignalType: "metric",
  schemaVersion: 1,
  producer: { id: "runtime-projection", producerClass: "runtime", version: "1.0.0" },
  source: { component: "runtime-projection", operation: "rebuild" },
  timestamp: "2026-07-21T12:00:00.000Z",
  tenantScope: { kind: "tenant", tenantId: "tenant-a", resolvedBy: "server" },
  platformScope: { kind: "none" },
  correlation: {
    relationships: [
      { type: "request", id: "request-1", tenantId: "tenant-a", resolvedBy: "server" },
      { type: "execution", id: "execution-1", tenantId: "tenant-a", resolvedBy: "server" },
    ],
  },
  candidateSeverity: "info",
  payload: { name: "projection.rebuild", value: 12, unit: "ms", kind: "histogram-observation" },
  metadata: { environment: "simulation", buildVersion: "33ae12d" },
  evidenceCompleteness: "FULL",
};

const decision: SignalPolicyDecision<"metric"> = {
  decision: "accept",
  signalType: "metric",
  schemaVersion: 1,
  policyVersion: 1,
  disposition: "telemetry",
  retention: "operational",
  severity: "info",
  tenantScope: candidate.tenantScope,
  platformScope: candidate.platformScope,
  maxPayloadBytes: 8_192,
  sampled: true,
  redactionApplied: true,
};

function main(): void {
  const signal = createCanonicalSignal({
    candidate,
    policyDecision: decision,
    receivedAt: new Date("2026-07-21T12:00:01.000Z"),
    maxClockDriftMs: 5_000,
  });

  assert.equal(signal.signalType, "metric");
  assert.equal(signal.canonicalEventTime, "2026-07-21T12:00:01.000Z");
  assert.equal(signal.severity, decision.severity);
  assert.equal(Object.isFrozen(signal), true);
  assert.equal(Object.isFrozen(signal.payload), true);
  assert.equal(Object.isFrozen(signal.metadata), true);
  assert.equal(Object.isFrozen(signal.correlation.relationships), true);

  if (false) {
    const metadata: CanonicalSignalMetadata = {
      // @ts-expect-error Credential metadata is not part of the allow-list.
      accessToken: "secret",
    };
    // @ts-expect-error Canonical signals can only be created by the factory.
    const invalid = { ...candidate, metadata } satisfies typeof signal;
    void invalid;
  }

  console.log("canonical signal contract checks passed");
}

main();
