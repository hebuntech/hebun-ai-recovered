import assert from "node:assert/strict";
import {
  createCanonicalSignal,
  SignalContractError,
  type NormalizedSignalCandidate,
  type SignalPolicyDecision,
} from "../../src/features/observability";

const baseCandidate: NormalizedSignalCandidate<"diagnostic"> = {
  signalId: "diagnostic-1",
  candidateSignalType: "diagnostic",
  schemaVersion: 1,
  producer: { id: "database-diagnostics", producerClass: "infrastructure", version: "1" },
  source: { component: "database", operation: "availability" },
  timestamp: "2026-07-21T12:00:00.000Z",
  tenantScope: { kind: "tenant", tenantId: "tenant-a", resolvedBy: "server" },
  platformScope: { kind: "none" },
  correlation: {
    relationships: [
      { type: "request", id: "request-1", tenantId: "tenant-a", resolvedBy: "server" },
    ],
  },
  candidateSeverity: "warning",
  payload: { code: "DB_UNAVAILABLE", component: "database", status: "unavailable", summary: "Unavailable" },
  metadata: { dataClassification: "internal" },
  evidenceCompleteness: "FULL",
};

const decision: SignalPolicyDecision<"diagnostic"> = {
  decision: "accept",
  signalType: "diagnostic",
  schemaVersion: 1,
  policyVersion: 1,
  disposition: "telemetry",
  retention: "operational",
  severity: "warning",
  tenantScope: baseCandidate.tenantScope,
  platformScope: baseCandidate.platformScope,
  maxPayloadBytes: 8_192,
  sampled: true,
  redactionApplied: true,
  approvedRoutes: ["telemetry"],
};

function expectFailure(
  candidate: NormalizedSignalCandidate<"diagnostic">,
  policyDecision: SignalPolicyDecision<"diagnostic">,
  code: SignalContractError["code"],
): void {
  assert.throws(
    () => createCanonicalSignal({
      candidate,
      policyDecision,
      receivedAt: new Date("2026-07-21T12:00:01.000Z"),
      maxClockDriftMs: 5_000,
    }),
    (error: unknown) => error instanceof SignalContractError && error.code === code,
  );
}

function main(): void {
  expectFailure(
    { ...baseCandidate, metadata: { accessToken: "secret" } },
    decision,
    "FORBIDDEN_CREDENTIAL",
  );
  expectFailure(
    { ...baseCandidate, payload: { ...baseCandidate.payload as object, nested: { authorizationHeader: "Bearer secret" } } },
    decision,
    "FORBIDDEN_CREDENTIAL",
  );
  expectFailure(
    { ...baseCandidate, payload: { ...baseCandidate.payload as object, unexpected: "field" } },
    decision,
    "INVALID_PAYLOAD",
  );
  expectFailure(
    { ...baseCandidate, metadata: { environment: "production" } },
    decision,
    "FORBIDDEN_METADATA",
  );
  expectFailure(
    { ...baseCandidate, correlation: { relationships: [{ type: "request", id: "request-1", tenantId: "tenant-b", resolvedBy: "server" }] } },
    decision,
    "CROSS_TENANT_CORRELATION",
  );
  expectFailure(
    { ...baseCandidate, correlation: { relationships: [{ type: "request", id: "request-1", tenantId: "tenant-a", resolvedBy: "client" as "server" }] } },
    decision,
    "UNRESOLVED_CORRELATION",
  );
  expectFailure(baseCandidate, { ...decision, decision: "reject" }, "POLICY_REJECTED");
  expectFailure(baseCandidate, { ...decision, redactionApplied: false }, "POLICY_REJECTED");
  expectFailure({ ...baseCandidate, signalId: " " }, decision, "INVALID_SIGNAL");

  console.log("signal security boundary checks passed");
}

main();
