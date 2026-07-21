import {
  canonicalSignalSchemaRegistry,
  createRequestCorrelationContext,
  InMemoryAppendOnlySignalSink,
  type CanonicalSignalType,
  type ProducerObservation,
  type RequestCorrelationContext,
  type SignalPolicyDecision,
  type SignalPolicyEngine,
  type SignalRoute,
} from "../../src/features/observability";

export const tenantContext: RequestCorrelationContext = createRequestCorrelationContext({
  tenantScope: { kind: "tenant", tenantId: "tenant-a", resolvedBy: "server" },
  platformScope: { kind: "none" },
  relationships: [
    { type: "request", id: "request-server-1", tenantId: "tenant-a" },
    { type: "execution", id: "execution-1", tenantId: "tenant-a" },
  ],
});

export function metricObservation(overrides: Partial<ProducerObservation> = {}): ProducerObservation {
  return {
    signalId: "signal-1",
    signalType: "metric",
    schemaVersion: 1,
    producer: { id: "runtime-projection", producerClass: "runtime", version: "1.0.0" },
    source: { component: "runtime-projection", operation: "rebuild" },
    timestamp: "2026-07-21T12:00:00.000Z",
    tenantIdCandidate: "tenant-a",
    correlationCandidates: [{ type: "request", id: "request-server-1", tenantId: "tenant-a" }],
    severityCandidate: "info",
    payload: { name: "projection.rebuild", value: 12, unit: "ms", kind: "histogram-observation" },
    metadata: { environment: "simulation" },
    evidenceCompleteness: "FULL",
    ...overrides,
  };
}

export function policyEngine(disposition: SignalRoute | "discard" = "telemetry"): SignalPolicyEngine {
  return {
    evaluate<T extends CanonicalSignalType>(candidate: Parameters<SignalPolicyEngine["evaluate"]>[0]): SignalPolicyDecision<T> {
      return {
        decision: "accept",
        signalType: candidate.candidateSignalType as T,
        schemaVersion: candidate.schemaVersion,
        policyVersion: 1,
        disposition,
        retention: disposition === "audit" ? "security" : "operational",
        severity: candidate.candidateSeverity,
        tenantScope: candidate.tenantScope,
        platformScope: candidate.platformScope,
        maxPayloadBytes: canonicalSignalSchemaRegistry.resolve(candidate.candidateSignalType, candidate.schemaVersion).maxPayloadBytes,
        sampled: true,
        redactionApplied: true,
        approvedRoutes: disposition === "discard" ? [] : [disposition],
      };
    },
  };
}

export function sink(route: SignalRoute = "telemetry", capacity = 10): InMemoryAppendOnlySignalSink {
  return new InMemoryAppendOnlySignalSink({ route, capacity });
}
