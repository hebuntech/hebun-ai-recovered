import type {
  CanonicalSignal,
  CanonicalSignalType,
  CollectionResult,
  EvidenceCompleteness,
  RequestCorrelationContext,
  SignalEmitter,
  SignalSeverity,
  PlatformScope,
  TenantScope,
} from "../observability";

export type MonitorLifecycle = "active" | "deprecated" | "retired";
export type MonitorCompatibility = "backward-compatible" | "breaking";
export type HealthState = "healthy" | "watch" | "degraded" | "critical" | "unknown";
export type MonitoringAuthorityScope = Extract<TenantScope, { kind: "tenant" }> | Extract<PlatformScope, { kind: "platform" }>;
export type WindowDefinition =
  | { readonly kind: "fixed"; readonly durationMs: number }
  | { readonly kind: "rolling"; readonly durationMs: number }
  | { readonly kind: "sliding"; readonly durationMs: number; readonly slideMs: number };

export type HealthRule =
  | { readonly ruleId: string; readonly kind: "threshold"; readonly operator: "gt" | "gte" | "lt" | "lte"; readonly value: number; readonly state: Exclude<HealthState, "healthy" | "unknown"> }
  | { readonly ruleId: string; readonly kind: "window"; readonly minimumSignals: number; readonly state: Exclude<HealthState, "healthy" | "unknown"> }
  | { readonly ruleId: string; readonly kind: "ratio"; readonly maximumFailureRatio: number; readonly state: Exclude<HealthState, "healthy" | "unknown"> }
  | { readonly ruleId: string; readonly kind: "trend"; readonly maximumNegativeDelta: number; readonly state: Exclude<HealthState, "healthy" | "unknown"> }
  | { readonly ruleId: string; readonly kind: "composite"; readonly ruleReferences: readonly string[]; readonly strategy: "any" | "all"; readonly state: Exclude<HealthState, "healthy" | "unknown"> };

export interface MonitorDefinition {
  readonly monitorId: string;
  readonly version: string;
  readonly lifecycle: MonitorLifecycle;
  readonly owner: string;
  readonly compatibility: MonitorCompatibility;
  readonly compatibleSignalSchemaVersions: readonly number[];
  readonly subject: { readonly type: string; readonly id: string; readonly component: string };
  readonly signalSources: readonly CanonicalSignalType[];
  readonly window: WindowDefinition;
  readonly rules: readonly HealthRule[];
  readonly aggregation: "count" | "average" | "ratio" | "latest";
  readonly evaluationFrequencyMs: number;
  readonly severityMapping: Readonly<Record<HealthState, SignalSeverity>>;
  readonly allowUnknownEvidence: boolean;
}

export interface MonitorRegistryEntry {
  readonly monitorId: string;
  readonly version: string;
  readonly lifecycle: MonitorLifecycle;
  readonly owner: string;
  readonly compatibility: MonitorCompatibility;
  readonly compatibleSignalSchemaVersions: readonly number[];
}

export interface EvaluationWindow {
  readonly kind: WindowDefinition["kind"];
  readonly start: string;
  readonly end: string;
}

export interface HealthSnapshot {
  readonly snapshotId: string;
  readonly monitorId: string;
  readonly monitorVersion: string;
  readonly subject: MonitorDefinition["subject"];
  readonly state: HealthState;
  readonly severity: SignalSeverity;
  readonly evidenceCompleteness: EvidenceCompleteness;
  readonly evidenceReferences: readonly string[];
  readonly window: EvaluationWindow;
  readonly evaluatedAt: string;
}

export interface AlertCandidate {
  readonly candidateId: string;
  readonly monitorId: string;
  readonly monitorVersion: string;
  readonly healthState: Exclude<HealthState, "healthy" | "unknown">;
  readonly severity: SignalSeverity;
  readonly evidenceReferences: readonly string[];
  readonly createdAt: string;
  readonly correlation: CanonicalSignal["correlation"];
}

export type MonitoringResult =
  | { readonly status: HealthState; readonly snapshot: HealthSnapshot; readonly alertCandidate?: AlertCandidate }
  | { readonly status: "insufficient_evidence"; readonly evidenceCompleteness: "MISSING"; readonly window: EvaluationWindow }
  | { readonly status: "evaluation_failed"; readonly reason: string };

export interface HealthHistory {
  readonly snapshots: readonly HealthSnapshot[];
}

export interface MonitoringAggregate {
  readonly key: string;
  readonly tenantId?: string;
  readonly platformAuthority?: string;
  readonly monitorId: string;
  readonly component: string;
  readonly signalType: CanonicalSignalType;
  readonly window: EvaluationWindow;
  readonly count: number;
}

export type MonitorFactoryResult<T> =
  | { readonly status: "created"; readonly value: T }
  | { readonly status: "invalid"; readonly reason: string };

export interface HealthSignalDependencies {
  readonly emitter: SignalEmitter;
  readonly correlationContext: RequestCorrelationContext;
  readonly now: () => Date;
}

export type HealthSignalEmissionResult =
  | { readonly status: "emitted"; readonly collection: Extract<CollectionResult, { status: "accepted" }> }
  | { readonly status: "not_emitted"; readonly reason: string; readonly collection?: CollectionResult };
