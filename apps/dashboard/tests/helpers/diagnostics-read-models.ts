import {
  createCanonicalSignal,
  type CanonicalSignal,
  type CanonicalSignalType,
  type NormalizedSignalCandidate,
  type SignalPolicyDecision,
} from "../../src/features/observability";

export function canonicalDiagnosticsSignal<T extends "evaluation-result" | "health-signal">(input: {
  readonly signalId: string;
  readonly signalType: T;
  readonly payload: T extends "evaluation-result"
    ? { readonly evaluationRunId: string; readonly evaluatorId: string; readonly evaluatorVersion: string; readonly subjectType: string; readonly subjectId: string; readonly outcome: "passed" | "failed" | "inconclusive"; readonly score?: number; readonly evidenceReferences: readonly string[] }
    : { readonly subjectType: string; readonly subjectId: string; readonly dimension: string; readonly state: "healthy" | "watch" | "degraded" | "critical" | "unknown"; readonly evidenceReferences: readonly string[]; readonly derivationVersion: string };
  readonly canonicalEventTime: string;
  readonly tenantId?: string;
  readonly platformAuthority?: string;
}): CanonicalSignal<T> {
  const tenantId = input.tenantId ?? "tenant-a";
  const platform = input.platformAuthority;
  const candidate: NormalizedSignalCandidate<T> = {
    signalId: input.signalId,
    candidateSignalType: input.signalType,
    schemaVersion: 1,
    producer: { id: input.signalType === "health-signal" ? "monitor-1" : "evaluator-1", producerClass: input.signalType === "health-signal" ? "internal-service" : "evaluation", version: "1" },
    source: { component: input.signalType === "health-signal" ? "monitoring" : "evaluation", operation: "project" },
    timestamp: input.canonicalEventTime,
    tenantScope: platform ? { kind: "none" } : { kind: "tenant", tenantId, resolvedBy: "server" },
    platformScope: platform ? { kind: "platform", authority: platform, resolvedBy: "server" } : { kind: "none" },
    correlation: { relationships: [{ type: input.signalType === "health-signal" ? "incident" : "evaluation-run", id: `correlation-${input.signalId}`, ...(platform ? {} : { tenantId }), resolvedBy: "server" }] },
    candidateSeverity: input.signalType === "health-signal" ? "warning" : "info",
    payload: input.payload,
    metadata: {},
    evidenceCompleteness: "FULL",
  };
  const decision: SignalPolicyDecision<T> = {
    decision: "accept", signalType: input.signalType as T & CanonicalSignalType, schemaVersion: 1, policyVersion: 1,
    disposition: "telemetry", retention: "operational", severity: candidate.candidateSeverity,
    tenantScope: candidate.tenantScope, platformScope: candidate.platformScope,
    maxPayloadBytes: 8_192, sampled: true, redactionApplied: true, approvedRoutes: ["telemetry"],
  };
  return createCanonicalSignal({ candidate, policyDecision: decision, receivedAt: new Date(input.canonicalEventTime), maxClockDriftMs: 0 });
}
