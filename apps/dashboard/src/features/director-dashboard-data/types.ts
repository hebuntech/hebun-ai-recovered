import type { ApplicationSessionAuthority } from "../auth/types";
import type { DiagnosticsAuthorityScope, DiagnosticsProjection } from "../diagnostics-read-models";
import type { EvaluationAggregate } from "../evaluation";
import type { HealthSnapshot, HealthState, MonitoringAggregate } from "../monitoring";
import type { EvidenceCompleteness } from "../observability";
import type { OrganizationRuntimeSnapshot } from "../organization-runtime";
import type { RuntimeProjectionSnapshot } from "../runtime-projection";
import type { WorkflowRuntimeModel } from "../workflow-runtime";

export const DASHBOARD_SECTION_IDS = [
  "runtime-overview", "agent-overview", "workflow-overview", "monitoring-summary",
  "health-summary", "diagnostics-summary", "evaluation-summary", "authentication-summary",
] as const;

export const DASHBOARD_DATA_SOURCES = [
  "runtime-status", "monitoring-snapshots", "health-snapshots", "diagnostics-snapshots",
  "evaluation-summaries", "authentication-session-metadata", "organization-metadata",
] as const;

export type DashboardSectionId = (typeof DASHBOARD_SECTION_IDS)[number];
export type DashboardDataSource = (typeof DASHBOARD_DATA_SOURCES)[number];
export type DashboardAuthorityScope = DiagnosticsAuthorityScope;
export type DashboardSectionLifecycle = "active" | "deprecated" | "retired";

export interface DashboardSectionDefinition {
  readonly sectionId: DashboardSectionId;
  readonly version: string;
  readonly owner: string;
  readonly lifecycle: DashboardSectionLifecycle;
  readonly supportedWidgets: readonly string[];
  readonly requiredDataSources: readonly DashboardDataSource[];
}

export interface RuntimeOverviewItem {
  readonly collection: string;
  readonly version: number;
  readonly status: "healthy" | "stale" | "uninitialized" | "error";
  readonly available: boolean;
  readonly itemCount: number;
  readonly checkedAt: string;
}

export interface AgentOverviewItem {
  readonly agentId: string;
  readonly name: string;
  readonly lifecycle: string;
  readonly healthState: string;
  readonly organizationId: string;
  readonly departmentId?: string;
}

export interface WorkflowOverviewItem {
  readonly workflowId: string;
  readonly name: string;
  readonly lifecycle: string;
  readonly healthState: string;
  readonly executionStatus: string;
  readonly organizationId: string;
  readonly departmentId?: string;
}

export interface MonitoringSummaryItem {
  readonly key: string;
  readonly monitorId: string;
  readonly component: string;
  readonly signalType: string;
  readonly count: number;
  readonly windowStart: string;
  readonly windowEnd: string;
}

export interface HealthSummaryItem {
  readonly snapshotId: string;
  readonly monitorId: string;
  readonly component: string;
  readonly healthState: HealthState;
  readonly evidenceCompleteness: EvidenceCompleteness;
  readonly evaluatedAt: string;
}

export interface DiagnosticsSummaryItem {
  readonly projectionId: string;
  readonly component: string;
  readonly severity: string;
  readonly evidenceCompleteness: EvidenceCompleteness;
  readonly canonicalEventTime: string;
}

export interface EvaluationSummaryItem {
  readonly key: string;
  readonly evaluatorId: string;
  readonly subjectType: string;
  readonly subjectId: string;
  readonly version: string;
  readonly count: number;
  readonly meanScore: number;
  readonly passed: number;
  readonly failed: number;
  readonly inconclusive: number;
}

export interface AuthenticationSummaryItem {
  readonly sessionContextId: string;
  readonly userId: string;
  readonly tenantId: string;
  readonly assuranceLevel: string;
  readonly mfaVerified: boolean;
  readonly authenticatedAt: string;
  readonly expiresAt: string;
  readonly sessionVersion: number;
}

export interface DashboardReadModels {
  readonly runtimeOverview: readonly RuntimeOverviewItem[];
  readonly agentOverview: readonly AgentOverviewItem[];
  readonly workflowOverview: readonly WorkflowOverviewItem[];
  readonly monitoringSummary: readonly MonitoringSummaryItem[];
  readonly healthSummary: readonly HealthSummaryItem[];
  readonly diagnosticsSummary: readonly DiagnosticsSummaryItem[];
  readonly evaluationSummary: readonly EvaluationSummaryItem[];
  readonly authenticationSummary: readonly AuthenticationSummaryItem[];
}

export interface DashboardSourceBundle {
  readonly authorityScope: DashboardAuthorityScope;
  readonly sourceVersions: Readonly<Record<DashboardDataSource, string>>;
  readonly runtimeSnapshots: readonly RuntimeProjectionSnapshot<unknown>[];
  readonly workflows: readonly WorkflowRuntimeModel[];
  readonly monitoringAggregates: readonly MonitoringAggregate[];
  readonly healthSnapshots: readonly HealthSnapshot[];
  readonly diagnosticsProjections: readonly DiagnosticsProjection[];
  readonly evaluationSummaries: readonly EvaluationAggregate[];
  readonly authenticationSessions: readonly ApplicationSessionAuthority[];
  readonly organization: OrganizationRuntimeSnapshot;
}

export interface DashboardSnapshot {
  readonly snapshotId: string;
  readonly generatedAt: string;
  readonly sourceVersions: Readonly<Record<DashboardDataSource, string>>;
  readonly completeness: EvidenceCompleteness;
  readonly projectionVersion: string;
  readonly authorityScope: DashboardAuthorityScope;
  readonly models: DashboardReadModels;
  readonly authoritative: false;
}

export type DashboardAggregationResult =
  | { readonly status: "success"; readonly snapshot: DashboardSnapshot }
  | { readonly status: "unavailable" | "invalid_scope"; readonly reason: string };

export interface DashboardQueryFilter {
  readonly tenantId?: string;
  readonly platformAuthority?: string;
  readonly component?: string;
  readonly agentId?: string;
  readonly workflowId?: string;
  readonly healthState?: HealthState;
  readonly evaluationStatus?: "passed" | "failed" | "inconclusive";
  readonly from?: string;
  readonly to?: string;
}

export type DashboardQueryResult =
  | { readonly status: "success"; readonly snapshot: DashboardSnapshot }
  | { readonly status: "empty"; readonly snapshot: DashboardSnapshot }
  | { readonly status: "unavailable" | "invalid_scope" | "invalid_filter"; readonly reason: string };
