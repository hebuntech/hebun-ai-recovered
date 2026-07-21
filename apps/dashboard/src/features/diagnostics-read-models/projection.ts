import {
  isCanonicalSignal,
  type CanonicalSignal,
  type EvaluationResultPayload,
  type HealthSignalPayload,
} from "../observability";
import type { DiagnosticsReadModelRegistry } from "./registry";
import type {
  DiagnosticsAuthorityScope,
  DiagnosticsProjection,
  DiagnosticsProjectionKind,
  DiagnosticsProjectionState,
  DiagnosticsSnapshot,
  ProjectionResult,
} from "./types";

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) deepFreeze(nested);
    Object.freeze(value);
  }
  return value;
}

function scopeMatches(signal: CanonicalSignal, authority: DiagnosticsAuthorityScope): boolean {
  return authority.kind === "tenant"
    ? signal.tenantScope.kind === "tenant" && signal.tenantScope.tenantId === authority.tenantId
    : signal.platformScope.kind === "platform" && signal.platformScope.authority === authority.authority;
}

function evidenceReferences(signal: CanonicalSignal): readonly string[] {
  if (signal.signalType === "evaluation-result") return [...(signal.payload as EvaluationResultPayload).evidenceReferences];
  if (signal.signalType === "health-signal") return [...(signal.payload as HealthSignalPayload).evidenceReferences];
  return [signal.signalId];
}

function base<K extends DiagnosticsProjectionKind>(signal: CanonicalSignal, kind: K) {
  return {
    projectionId: `${kind}:${signal.signalId}`,
    kind,
    sourceSignalId: signal.signalId,
    signalType: signal.signalType,
    schemaVersion: signal.schemaVersion,
    policyVersion: signal.policyVersion,
    canonicalEventTime: signal.canonicalEventTime,
    component: signal.source.component,
    serviceId: signal.producer.id,
    ...(signal.tenantScope.kind === "tenant" ? { tenantId: signal.tenantScope.tenantId } : {}),
    ...(signal.platformScope.kind === "platform" ? { platformAuthority: signal.platformScope.authority } : {}),
    severity: signal.severity,
    evidenceCompleteness: signal.evidenceCompleteness,
    evidenceReferences: evidenceReferences(signal),
    correlation: signal.correlation.relationships.map((relationship) => ({ ...relationship })),
  } as const;
}

function projectSignal(signal: CanonicalSignal, kinds: readonly DiagnosticsProjectionKind[]): readonly DiagnosticsProjection[] {
  const projections: DiagnosticsProjection[] = [];
  if (kinds.includes("component")) projections.push(base(signal, "component"));
  if (kinds.includes("service")) projections.push(base(signal, "service"));
  if (kinds.includes("tenant") && signal.tenantScope.kind === "tenant") projections.push({ ...base(signal, "tenant"), tenantId: signal.tenantScope.tenantId });
  if (kinds.includes("platform") && signal.platformScope.kind === "platform") projections.push({ ...base(signal, "platform"), platformAuthority: signal.platformScope.authority });
  if (kinds.includes("evaluation") && signal.signalType === "evaluation-result") {
    const payload = signal.payload as EvaluationResultPayload;
    projections.push({ ...base(signal, "evaluation"), evaluatorId: payload.evaluatorId, evaluatorVersion: payload.evaluatorVersion, evaluationRunId: payload.evaluationRunId, outcome: payload.outcome, ...(payload.score === undefined ? {} : { score: payload.score }) });
  }
  if (kinds.includes("health") && signal.signalType === "health-signal") {
    const payload = signal.payload as HealthSignalPayload;
    projections.push({ ...base(signal, "health"), monitorId: signal.producer.id, monitorVersion: payload.derivationVersion, healthState: payload.state });
  }
  return projections;
}

export function createProjectionState(readModelId: string, projectionVersion: string): DiagnosticsProjectionState {
  return Object.freeze({ readModelId, projectionVersion, projections: Object.freeze([]), sourceSignalIds: Object.freeze([]) });
}

export function projectCanonicalSignals(input: {
  readonly state: DiagnosticsProjectionState;
  readonly signals: readonly CanonicalSignal[];
  readonly registry: DiagnosticsReadModelRegistry;
  readonly authorityScope: DiagnosticsAuthorityScope;
}): ProjectionResult {
  const schemaVersion = input.signals[0]?.schemaVersion ?? 1;
  const resolution = input.registry.resolve(input.state.readModelId, input.state.projectionVersion, schemaVersion);
  if (resolution.status !== "resolved") return Object.freeze({ status: "projection_unavailable", reason: resolution.status });
  if (input.signals.some((signal) => !isCanonicalSignal(signal))) return Object.freeze({ status: "invalid_source", reason: "NON_CANONICAL_SOURCE" });
  if (input.signals.some((signal) => !scopeMatches(signal, input.authorityScope))) return Object.freeze({ status: "insufficient_scope", reason: "CROSS_SCOPE_SOURCE" });
  if (input.signals.some((signal) => !resolution.readModel.compatibleSignalSchemaVersions.includes(signal.schemaVersion))) {
    return Object.freeze({ status: "projection_unavailable", reason: "INCOMPATIBLE_SIGNAL_SCHEMA" });
  }
  const known = new Set(input.state.sourceSignalIds);
  const ordered = [...input.signals].sort((left, right) => left.canonicalEventTime.localeCompare(right.canonicalEventTime) || left.signalId.localeCompare(right.signalId));
  const newSignals = ordered.filter((signal) => !known.has(signal.signalId));
  const added = newSignals.flatMap((signal) => projectSignal(signal, resolution.readModel.projectionKinds));
  const state = deepFreeze({
    readModelId: input.state.readModelId,
    projectionVersion: input.state.projectionVersion,
    projections: [...input.state.projections, ...added],
    sourceSignalIds: [...input.state.sourceSignalIds, ...newSignals.map(({ signalId }) => signalId)],
  });
  return Object.freeze({ status: "success", state, added: added.length });
}

export function rebuildProjection(input: Omit<Parameters<typeof projectCanonicalSignals>[0], "state"> & { readonly readModelId: string; readonly projectionVersion: string }): ProjectionResult {
  return projectCanonicalSignals({ ...input, state: createProjectionState(input.readModelId, input.projectionVersion) });
}

export function createDiagnosticsSnapshot(state: DiagnosticsProjectionState, generatedAt: Date): DiagnosticsSnapshot | undefined {
  if (!Number.isFinite(generatedAt.getTime())) return undefined;
  const rank = { FULL: 0, PARTIAL: 1, UNKNOWN: 2, MISSING: 3 } as const;
  const completeness = state.projections.reduce<DiagnosticsSnapshot["completeness"]>((worst, projection) => rank[projection.evidenceCompleteness] > rank[worst] ? projection.evidenceCompleteness : worst, "FULL");
  return deepFreeze({
    snapshotId: `${state.readModelId}-${generatedAt.toISOString()}`,
    generatedAt: generatedAt.toISOString(),
    projectionVersion: state.projectionVersion,
    sourceReferences: [...state.sourceSignalIds],
    completeness: state.projections.length === 0 ? "MISSING" : completeness,
    projectionCount: state.projections.length,
    authoritative: false,
  });
}
