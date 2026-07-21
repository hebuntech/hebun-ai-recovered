import type {
  CanonicalSignalType,
  CorrelationRelationship,
  EvidenceCompleteness,
  HealthSignalPayload,
  PlatformScope,
  SignalSeverity,
  TenantScope,
} from "../observability";

export type ReadModelLifecycle = "active" | "deprecated" | "retired";
export type ReadModelCompatibility = "backward-compatible" | "breaking";
export type DiagnosticsProjectionKind = "component" | "service" | "tenant" | "platform" | "evaluation" | "health";
export type DiagnosticsAuthorityScope = Extract<TenantScope, { kind: "tenant" }> | Extract<PlatformScope, { kind: "platform" }>;

export interface ReadModelRegistryEntry {
  readonly readModelId: string;
  readonly version: string;
  readonly lifecycle: ReadModelLifecycle;
  readonly owner: string;
  readonly compatibility: ReadModelCompatibility;
  readonly compatibleSignalSchemaVersions: readonly number[];
  readonly projectionKinds: readonly DiagnosticsProjectionKind[];
}

export interface DiagnosticsProjectionBase {
  readonly projectionId: string;
  readonly kind: DiagnosticsProjectionKind;
  readonly sourceSignalId: string;
  readonly signalType: CanonicalSignalType;
  readonly schemaVersion: number;
  readonly policyVersion: number;
  readonly canonicalEventTime: string;
  readonly component: string;
  readonly serviceId: string;
  readonly tenantId?: string;
  readonly platformAuthority?: string;
  readonly severity: SignalSeverity;
  readonly evidenceCompleteness: EvidenceCompleteness;
  readonly evidenceReferences: readonly string[];
  readonly correlation: readonly CorrelationRelationship[];
}

export interface ComponentDiagnostics extends DiagnosticsProjectionBase {
  readonly kind: "component";
}

export interface ServiceDiagnostics extends DiagnosticsProjectionBase {
  readonly kind: "service";
}

export interface TenantDiagnostics extends DiagnosticsProjectionBase {
  readonly kind: "tenant";
  readonly tenantId: string;
}

export interface PlatformDiagnostics extends DiagnosticsProjectionBase {
  readonly kind: "platform";
  readonly platformAuthority: string;
}

export interface EvaluationDiagnostics extends DiagnosticsProjectionBase {
  readonly kind: "evaluation";
  readonly evaluatorId: string;
  readonly evaluatorVersion: string;
  readonly evaluationRunId: string;
  readonly outcome: "passed" | "failed" | "inconclusive";
  readonly score?: number;
}

export interface HealthDiagnostics extends DiagnosticsProjectionBase {
  readonly kind: "health";
  readonly monitorId: string;
  readonly monitorVersion: string;
  readonly healthState: HealthSignalPayload["state"];
}

export type DiagnosticsProjection =
  | ComponentDiagnostics
  | ServiceDiagnostics
  | TenantDiagnostics
  | PlatformDiagnostics
  | EvaluationDiagnostics
  | HealthDiagnostics;

export interface DiagnosticsProjectionState {
  readonly readModelId: string;
  readonly projectionVersion: string;
  readonly projections: readonly DiagnosticsProjection[];
  readonly sourceSignalIds: readonly string[];
}

export interface DiagnosticsSnapshot {
  readonly snapshotId: string;
  readonly generatedAt: string;
  readonly projectionVersion: string;
  readonly sourceReferences: readonly string[];
  readonly completeness: EvidenceCompleteness;
  readonly projectionCount: number;
  readonly authoritative: false;
}

export interface DiagnosticsTimelineEntry {
  readonly timelineId: string;
  readonly canonicalEventTime: string;
  readonly projectionId: string;
  readonly sourceSignalId: string;
  readonly component: string;
  readonly severity: SignalSeverity;
  readonly evidenceReferences: readonly string[];
  readonly correlation: readonly CorrelationRelationship[];
}

export interface DiagnosticsTimeline {
  readonly entries: readonly DiagnosticsTimelineEntry[];
  readonly correlationGroups: Readonly<Record<string, readonly string[]>>;
}

export interface DiagnosticsQueryFilter {
  readonly tenantId?: string;
  readonly platformAuthority?: string;
  readonly component?: string;
  readonly monitorId?: string;
  readonly evaluatorId?: string;
  readonly signalType?: CanonicalSignalType;
  readonly healthState?: HealthSignalPayload["state"];
  readonly severity?: SignalSeverity;
  readonly correlation?: { readonly type: CorrelationRelationship["type"]; readonly id: string };
  readonly from?: string;
  readonly to?: string;
}

export type ProjectionResult =
  | { readonly status: "success"; readonly state: DiagnosticsProjectionState; readonly added: number }
  | { readonly status: "projection_unavailable" | "insufficient_scope" | "invalid_source"; readonly reason: string };

export type DiagnosticsQueryResult =
  | { readonly status: "success"; readonly projections: readonly DiagnosticsProjection[] }
  | { readonly status: "empty"; readonly projections: readonly [] }
  | { readonly status: "insufficient_scope" | "invalid_filter" | "projection_unavailable"; readonly reason: string };
