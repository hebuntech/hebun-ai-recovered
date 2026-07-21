export const SIGNAL_TYPES = [
  "metric",
  "trace",
  "operational-event",
  "audit-event",
  "diagnostic",
  "evaluation-result",
  "health-signal",
  "business-signal",
] as const;

export type CanonicalSignalType = (typeof SIGNAL_TYPES)[number];
export type EvidenceCompleteness = "FULL" | "PARTIAL" | "UNKNOWN" | "MISSING";
export type SignalSeverity = "debug" | "info" | "warning" | "error" | "critical";

export interface SignalProducer {
  readonly id: string;
  readonly producerClass: "runtime" | "provider" | "infrastructure" | "evaluation" | "internal-service";
  readonly version: string;
}

export interface SignalSource {
  readonly component: string;
  readonly operation: string;
}

export type TenantScope =
  | { readonly kind: "tenant"; readonly tenantId: string; readonly resolvedBy: "server" }
  | { readonly kind: "none" };

export type PlatformScope =
  | { readonly kind: "platform"; readonly authority: string; readonly resolvedBy: "server" }
  | { readonly kind: "none" };

export type CorrelationRelationshipType =
  | "request"
  | "actor"
  | "session"
  | "command"
  | "workflow"
  | "execution"
  | "provider-invocation"
  | "evaluation-run"
  | "incident";

export interface CorrelationRelationship {
  readonly type: CorrelationRelationshipType;
  readonly id: string;
  readonly resolvedBy: "server";
  readonly tenantId?: string;
  readonly parentId?: string;
}

export interface SignalCorrelation {
  readonly relationships: readonly CorrelationRelationship[];
}

export interface CanonicalSignalMetadata {
  readonly environment?: "simulation" | "dry-run" | "live";
  readonly deploymentVersion?: string;
  readonly buildVersion?: string;
  readonly region?: string;
  readonly runtimeVersion?: string;
  readonly featureFlag?: string;
  readonly samplingDecisionId?: string;
  readonly redactionCode?: string;
  readonly supersededSignalId?: string;
  readonly diagnosticClassification?: string;
  readonly dataClassification?: "public" | "internal" | "confidential" | "restricted";
}

export interface MetricPayload {
  readonly name: string;
  readonly value: number;
  readonly unit: string;
  readonly kind: "counter" | "gauge" | "histogram-observation" | "rate-input";
  readonly dimensions?: Readonly<Record<string, string | number | boolean>>;
}

export interface TracePayload {
  readonly traceId: string;
  readonly spanId: string;
  readonly operation: string;
  readonly startedAt: string;
  readonly durationMs: number;
  readonly status: "ok" | "error" | "cancelled" | "unknown";
  readonly parentSpanId?: string;
}

export interface OperationalEventPayload {
  readonly name: string;
  readonly component: string;
  readonly outcome: "succeeded" | "failed" | "degraded" | "unknown";
  readonly reasonCode?: string;
}

export interface AuditEventPayload {
  readonly actorType: "human" | "agent" | "system" | "service";
  readonly actorId: string;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly authoritySource: "membership" | "platform-admin" | "internal-service" | "system";
  readonly result: "succeeded" | "rejected" | "failed";
  readonly simulation: boolean;
}

export interface DiagnosticPayload {
  readonly code: string;
  readonly component: string;
  readonly status: "available" | "degraded" | "unavailable" | "unknown";
  readonly summary: string;
  readonly operatorAction?: string;
}

export interface EvaluationResultPayload {
  readonly evaluationRunId: string;
  readonly evaluatorId: string;
  readonly evaluatorVersion: string;
  readonly subjectType: string;
  readonly subjectId: string;
  readonly outcome: "passed" | "failed" | "inconclusive";
  readonly score?: number;
  readonly evidenceReferences: readonly string[];
}

export interface HealthSignalPayload {
  readonly subjectType: string;
  readonly subjectId: string;
  readonly dimension: string;
  readonly state: "healthy" | "watch" | "degraded" | "critical" | "unknown";
  readonly evidenceReferences: readonly string[];
  readonly derivationVersion: string;
}

export interface BusinessSignalPayload {
  readonly name: string;
  readonly domain: string;
  readonly subjectType: string;
  readonly subjectId: string;
  readonly state: string;
  readonly evidenceReferences: readonly string[];
}

export interface CanonicalSignalPayloadMap {
  readonly metric: MetricPayload;
  readonly trace: TracePayload;
  readonly "operational-event": OperationalEventPayload;
  readonly "audit-event": AuditEventPayload;
  readonly diagnostic: DiagnosticPayload;
  readonly "evaluation-result": EvaluationResultPayload;
  readonly "health-signal": HealthSignalPayload;
  readonly "business-signal": BusinessSignalPayload;
}

declare const canonicalSignalBrand: unique symbol;

export interface CanonicalSignal<T extends CanonicalSignalType = CanonicalSignalType> {
  readonly [canonicalSignalBrand]: true;
  readonly signalId: string;
  readonly signalType: T;
  readonly schemaVersion: number;
  readonly producer: SignalProducer;
  readonly source: SignalSource;
  readonly timestamp: string;
  readonly canonicalEventTime: string;
  readonly tenantScope: TenantScope;
  readonly platformScope: PlatformScope;
  readonly correlation: SignalCorrelation;
  readonly severity: SignalSeverity;
  readonly policyVersion: number;
  readonly payload: CanonicalSignalPayloadMap[T];
  readonly metadata: CanonicalSignalMetadata;
  readonly evidenceCompleteness: EvidenceCompleteness;
}

export interface NormalizedSignalCandidate<T extends CanonicalSignalType = CanonicalSignalType> {
  readonly signalId: string;
  readonly candidateSignalType: T;
  readonly schemaVersion: number;
  readonly producer: SignalProducer;
  readonly source: SignalSource;
  readonly timestamp: string;
  readonly tenantScope: TenantScope;
  readonly platformScope: PlatformScope;
  readonly correlation: SignalCorrelation;
  readonly candidateSeverity: SignalSeverity;
  readonly payload: unknown;
  readonly metadata: unknown;
  readonly evidenceCompleteness: EvidenceCompleteness;
}
