import {
  createCanonicalSignal,
  type CanonicalSignal,
  type EvidenceCompleteness,
  type NormalizedSignalCandidate,
  type SignalPolicyDecision,
} from "../../src/features/observability";
import type { MonitorDefinition } from "../../src/features/monitoring";

export function canonicalMetric(input: {
  readonly signalId: string;
  readonly value: number;
  readonly canonicalEventTime: string;
  readonly tenantId?: string;
  readonly evidenceCompleteness?: EvidenceCompleteness;
}): CanonicalSignal {
  const tenantId = input.tenantId ?? "tenant-a";
  const candidate: NormalizedSignalCandidate<"metric"> = {
    signalId: input.signalId, candidateSignalType: "metric", schemaVersion: 1,
    producer: { id: "runtime", producerClass: "runtime", version: "1" },
    source: { component: "api", operation: "latency" }, timestamp: input.canonicalEventTime,
    tenantScope: { kind: "tenant", tenantId, resolvedBy: "server" }, platformScope: { kind: "none" },
    correlation: { relationships: [{ type: "request", id: `request-${input.signalId}`, tenantId, resolvedBy: "server" }] },
    candidateSeverity: "info", payload: { name: "latency", value: input.value, unit: "ms", kind: "gauge" },
    metadata: {}, evidenceCompleteness: input.evidenceCompleteness ?? "FULL",
  };
  const decision: SignalPolicyDecision<"metric"> = {
    decision: "accept", signalType: "metric", schemaVersion: 1, policyVersion: 1,
    disposition: "telemetry", retention: "operational", severity: "info",
    tenantScope: candidate.tenantScope, platformScope: candidate.platformScope,
    maxPayloadBytes: 8_192, sampled: true, redactionApplied: true, approvedRoutes: ["telemetry"],
  };
  return createCanonicalSignal({ candidate, policyDecision: decision, receivedAt: new Date(input.canonicalEventTime), maxClockDriftMs: 0 });
}

export function canonicalOperationalEvent(input: {
  readonly signalId: string;
  readonly outcome: "succeeded" | "failed" | "degraded" | "unknown";
  readonly canonicalEventTime: string;
}): CanonicalSignal {
  const candidate: NormalizedSignalCandidate<"operational-event"> = {
    signalId: input.signalId, candidateSignalType: "operational-event", schemaVersion: 1,
    producer: { id: "runtime", producerClass: "runtime", version: "1" },
    source: { component: "api", operation: "request" }, timestamp: input.canonicalEventTime,
    tenantScope: { kind: "tenant", tenantId: "tenant-a", resolvedBy: "server" }, platformScope: { kind: "none" },
    correlation: { relationships: [{ type: "request", id: `request-${input.signalId}`, tenantId: "tenant-a", resolvedBy: "server" }] },
    candidateSeverity: "info", payload: { name: "request", component: "api", outcome: input.outcome }, metadata: {}, evidenceCompleteness: "FULL",
  };
  const decision: SignalPolicyDecision<"operational-event"> = {
    decision: "accept", signalType: "operational-event", schemaVersion: 1, policyVersion: 1,
    disposition: "telemetry", retention: "operational", severity: "info", tenantScope: candidate.tenantScope,
    platformScope: candidate.platformScope, maxPayloadBytes: 8_192, sampled: true, redactionApplied: true, approvedRoutes: ["telemetry"],
  };
  return createCanonicalSignal({ candidate, policyDecision: decision, receivedAt: new Date(input.canonicalEventTime), maxClockDriftMs: 0 });
}

export function monitorDefinition(overrides: Partial<MonitorDefinition> = {}): MonitorDefinition {
  return {
    monitorId: "latency-monitor", version: "1", lifecycle: "active", owner: "monitoring",
    compatibility: "backward-compatible", compatibleSignalSchemaVersions: [1],
    subject: { type: "component", id: "api", component: "api" }, signalSources: ["metric"],
    window: { kind: "rolling", durationMs: 60_000 },
    rules: [{ ruleId: "critical-latency", kind: "threshold", operator: "gte", value: 500, state: "critical" }],
    aggregation: "average", evaluationFrequencyMs: 10_000,
    severityMapping: { healthy: "info", watch: "warning", degraded: "error", critical: "critical", unknown: "warning" },
    allowUnknownEvidence: false,
    ...overrides,
  };
}
