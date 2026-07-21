import type { DashboardAuthorityScope, DashboardSnapshot } from "../director-dashboard-data";
import type { WidgetRegistry } from "./registry";
import type { DashboardWidgetId, WidgetBindingResult, WidgetDisplayItem, WidgetViewModel } from "./types";
import { deepFreeze } from "./validation";

function scopeMatches(snapshot: DashboardSnapshot, authority: DashboardAuthorityScope): boolean {
  return authority.kind === "tenant"
    ? snapshot.authorityScope.kind === "tenant" && snapshot.authorityScope.tenantId === authority.tenantId
    : snapshot.authorityScope.kind === "platform" && snapshot.authorityScope.authority === authority.authority;
}

function viewModel(widgetId: DashboardWidgetId, snapshot: DashboardSnapshot): WidgetViewModel {
  let title = "";
  let displayStatus = "available";
  let items: WidgetDisplayItem[] = [];
  if (widgetId === "runtime-overview") {
    title = "Runtime Overview";
    items = snapshot.models.runtimeOverview.map((item) => ({ id: item.collection, label: item.collection, value: String(item.itemCount), status: item.status }));
    displayStatus = items.some(({ status }) => status === "error") ? "error" : "operational";
  } else if (widgetId === "active-agents") {
    title = "Active Agents";
    items = snapshot.models.agentOverview.filter(({ lifecycle }) => lifecycle === "active").map((item) => ({ id: item.agentId, label: item.name, value: item.organizationId, status: item.healthState }));
  } else if (widgetId === "active-workflows") {
    title = "Active Workflows";
    items = snapshot.models.workflowOverview.filter(({ lifecycle }) => lifecycle === "active").map((item) => ({ id: item.workflowId, label: item.name, value: item.executionStatus, status: item.healthState }));
  } else if (widgetId === "monitoring-summary") {
    title = "Monitoring Summary";
    items = snapshot.models.monitoringSummary.map((item) => ({ id: item.key, label: item.monitorId, value: String(item.count), status: item.signalType }));
  } else if (widgetId === "health-summary") {
    title = "Health Summary";
    items = snapshot.models.healthSummary.map((item) => ({ id: item.snapshotId, label: item.component, value: item.healthState, status: item.evidenceCompleteness }));
    displayStatus = items.some(({ value }) => value === "critical") ? "critical" : items.some(({ value }) => value === "degraded") ? "degraded" : "healthy";
  } else if (widgetId === "diagnostics-summary") {
    title = "Diagnostics Summary";
    items = snapshot.models.diagnosticsSummary.map((item) => ({ id: item.projectionId, label: item.component, value: item.severity, status: item.evidenceCompleteness }));
  } else if (widgetId === "evaluation-summary") {
    title = "Evaluation Summary";
    items = snapshot.models.evaluationSummary.map((item) => ({ id: item.key, label: item.evaluatorId, value: `${item.passed}/${item.count}`, status: item.failed > 0 ? "failed" : item.inconclusive > 0 ? "inconclusive" : "passed" }));
  } else {
    title = "Authentication Summary";
    items = snapshot.models.authenticationSummary.map((item) => ({ id: item.sessionContextId, label: item.userId, value: item.assuranceLevel, status: item.mfaVerified ? "mfa" : "standard" }));
  }
  return deepFreeze({ widgetId, sourceSnapshotId: snapshot.snapshotId, title, primaryValue: String(items.length), displayStatus, items, authoritative: false });
}

export function bindWidget(input: {
  readonly registry: WidgetRegistry;
  readonly widgetId: string;
  readonly version: string;
  readonly snapshot?: DashboardSnapshot;
  readonly authorityScope: DashboardAuthorityScope;
}): WidgetBindingResult {
  const resolution = input.registry.resolve(input.widgetId, input.version);
  if (resolution.status !== "resolved") return Object.freeze({ state: "unavailable", reason: "UNKNOWN_WIDGET" });
  if (!input.snapshot) return Object.freeze({ state: "unavailable", reason: "DASHBOARD_SNAPSHOT_UNAVAILABLE" });
  if (!scopeMatches(input.snapshot, input.authorityScope)) return Object.freeze({ state: "unavailable", reason: "INVALID_SCOPE" });
  try {
    const model = viewModel(resolution.widget.widgetId, input.snapshot);
    return Object.freeze({ state: model.items.length === 0 ? "empty" : "ready", viewModel: model });
  } catch {
    return Object.freeze({ state: "failed", reason: "WIDGET_BINDING_FAILED" });
  }
}
