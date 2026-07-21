import type { DashboardRegistry } from "./registry";
import {
  DASHBOARD_DATA_SOURCES,
  DASHBOARD_SECTION_IDS,
  type DashboardAggregationResult,
  type DashboardAuthorityScope,
  type DashboardReadModels,
  type DashboardSourceBundle,
  type DashboardSnapshot,
} from "./types";
import { deepFreeze, validVersion } from "./validation";

function sameScope(left: DashboardAuthorityScope, right: DashboardAuthorityScope): boolean {
  return left.kind === right.kind && (left.kind === "tenant"
    ? right.kind === "tenant" && left.tenantId === right.tenantId
    : right.kind === "platform" && left.authority === right.authority);
}

function sourcesValid(source: DashboardSourceBundle): boolean {
  if (DASHBOARD_DATA_SOURCES.some((key) => !validVersion(source.sourceVersions[key]))) return false;
  if (source.authorityScope.kind === "tenant") {
    const tenantId = source.authorityScope.tenantId;
    if (source.monitoringAggregates.some((item) => item.tenantId !== tenantId || item.platformAuthority !== undefined)) return false;
    if (source.diagnosticsProjections.some((item) => item.tenantId !== tenantId || item.platformAuthority !== undefined)) return false;
    if (source.authenticationSessions.some((item) => item.activeTenantId !== tenantId)) return false;
  } else {
    const authority = source.authorityScope.authority;
    if (source.monitoringAggregates.some((item) => item.platformAuthority !== authority || item.tenantId !== undefined)) return false;
    if (source.diagnosticsProjections.some((item) => item.platformAuthority !== authority || item.tenantId !== undefined)) return false;
    if (source.authenticationSessions.length > 0) return false;
  }
  return true;
}

function completeness(source: DashboardSourceBundle): DashboardSnapshot["completeness"] {
  const evidence = [
    ...source.healthSnapshots.map((item) => item.evidenceCompleteness),
    ...source.diagnosticsProjections.map((item) => item.evidenceCompleteness),
  ];
  if (evidence.length === 0) return "MISSING";
  const rank = { FULL: 0, PARTIAL: 1, UNKNOWN: 2, MISSING: 3 } as const;
  return evidence.reduce<DashboardSnapshot["completeness"]>((worst, value) => rank[value] > rank[worst] ? value : worst, "FULL");
}

function project(source: DashboardSourceBundle): DashboardReadModels {
  const runtimeOverview = source.runtimeSnapshots.map((item) => ({
    collection: item.collection, version: item.version.value, status: item.health.status,
    available: item.availability.available, itemCount: item.statistics.itemCount, checkedAt: item.health.checkedAt,
  })).sort((left, right) => left.collection.localeCompare(right.collection));
  const agentOverview = source.organization.agents.map((item) => ({
    agentId: item.identity.id, name: item.identity.name, lifecycle: item.lifecycle.status,
    healthState: item.health.status, organizationId: item.organization.id,
    ...(item.department ? { departmentId: item.department.id } : {}),
  })).sort((left, right) => left.agentId.localeCompare(right.agentId));
  const workflowOverview = source.workflows.map((item) => ({
    workflowId: item.identity.id, name: item.identity.name, lifecycle: item.lifecycle.status,
    healthState: item.health.status, executionStatus: item.executionStatus, organizationId: item.organization.id,
    ...(item.department ? { departmentId: item.department.id } : {}),
  })).sort((left, right) => left.workflowId.localeCompare(right.workflowId));
  const monitoringSummary = source.monitoringAggregates.map((item) => ({
    key: item.key, monitorId: item.monitorId, component: item.component, signalType: item.signalType,
    count: item.count, windowStart: item.window.start, windowEnd: item.window.end,
  })).sort((left, right) => left.key.localeCompare(right.key));
  const healthSummary = source.healthSnapshots.map((item) => ({
    snapshotId: item.snapshotId, monitorId: item.monitorId, component: item.subject.component,
    healthState: item.state, evidenceCompleteness: item.evidenceCompleteness, evaluatedAt: item.evaluatedAt,
  })).sort((left, right) => left.evaluatedAt.localeCompare(right.evaluatedAt) || left.snapshotId.localeCompare(right.snapshotId));
  const diagnosticsSummary = source.diagnosticsProjections.map((item) => ({
    projectionId: item.projectionId, component: item.component, severity: item.severity,
    evidenceCompleteness: item.evidenceCompleteness, canonicalEventTime: item.canonicalEventTime,
  })).sort((left, right) => left.canonicalEventTime.localeCompare(right.canonicalEventTime) || left.projectionId.localeCompare(right.projectionId));
  const evaluationSummary = source.evaluationSummaries.map((item) => ({ ...item }))
    .sort((left, right) => left.key.localeCompare(right.key));
  const authenticationSummary = source.authenticationSessions.map((item) => ({
    sessionContextId: item.sessionContextId, userId: item.userId, tenantId: item.activeTenantId,
    assuranceLevel: item.assuranceLevel, mfaVerified: item.mfaVerified, authenticatedAt: item.authenticatedAt,
    expiresAt: item.absoluteExpiresAt, sessionVersion: item.sessionVersion,
  })).sort((left, right) => left.sessionContextId.localeCompare(right.sessionContextId));
  return deepFreeze({ runtimeOverview, agentOverview, workflowOverview, monitoringSummary, healthSummary, diagnosticsSummary, evaluationSummary, authenticationSummary });
}

export function createDashboardSnapshot(input: {
  readonly registry: DashboardRegistry;
  readonly source: DashboardSourceBundle;
  readonly authorityScope: DashboardAuthorityScope;
  readonly projectionVersion: string;
  readonly generatedAt: Date;
}): DashboardAggregationResult {
  if (!sameScope(input.source.authorityScope, input.authorityScope)) return Object.freeze({ status: "invalid_scope", reason: "CROSS_SCOPE_SOURCE" });
  if (!sourcesValid(input.source)) return Object.freeze({ status: "invalid_scope", reason: "INVALID_SOURCE_SCOPE" });
  if (!validVersion(input.projectionVersion) || !Number.isFinite(input.generatedAt.getTime()) ||
      DASHBOARD_SECTION_IDS.some((sectionId) => input.registry.resolve(sectionId, input.projectionVersion).status !== "resolved")) {
    return Object.freeze({ status: "unavailable", reason: "DASHBOARD_PROJECTION_UNAVAILABLE" });
  }
  const generatedAt = input.generatedAt.toISOString();
  const snapshot: DashboardSnapshot = deepFreeze({
    snapshotId: `director-dashboard-${input.authorityScope.kind === "tenant" ? input.authorityScope.tenantId : input.authorityScope.authority}-${generatedAt}`,
    generatedAt,
    sourceVersions: { ...input.source.sourceVersions },
    completeness: completeness(input.source),
    projectionVersion: input.projectionVersion,
    authorityScope: { ...input.authorityScope },
    models: project(input.source),
    authoritative: false,
  });
  return Object.freeze({ status: "success", snapshot });
}

export function replayDashboardSnapshot(input: Parameters<typeof createDashboardSnapshot>[0]): DashboardAggregationResult {
  return createDashboardSnapshot(input);
}
