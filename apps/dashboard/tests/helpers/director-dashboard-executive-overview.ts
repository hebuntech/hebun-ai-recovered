import {
  DASHBOARD_WIDGET_IDS,
  type DashboardWidgetId,
  type WidgetDisplayItem,
  type WidgetRuntimeSnapshot,
  type WidgetRuntimeState,
} from "../../src/features/director-dashboard-widget-runtime";

const SNAPSHOT_ID = "director-dashboard-hebun-dashboard-2026-07-21T12:00:00.000Z";

export function readyState(
  widgetId: DashboardWidgetId,
  items: readonly WidgetDisplayItem[],
  displayStatus = "available",
): WidgetRuntimeState {
  return {
    widgetId,
    state: items.length === 0 ? "empty" : "ready",
    viewModel: {
      widgetId,
      sourceSnapshotId: SNAPSHOT_ID,
      title: widgetId,
      primaryValue: String(items.length),
      displayStatus,
      items,
      authoritative: false,
    },
  };
}

/** Every widget ready with one benign record. */
export function healthyRuntime(overrides: Partial<Record<DashboardWidgetId, WidgetRuntimeState>> = {}): WidgetRuntimeSnapshot {
  const defaults: Record<DashboardWidgetId, WidgetRuntimeState> = {
    "runtime-overview": readyState("runtime-overview", [{ id: "a", label: "a", value: "1", status: "healthy" }], "operational"),
    "active-agents": readyState("active-agents", [{ id: "agent-1", label: "Agent", value: "org-1", status: "healthy" }]),
    "active-workflows": readyState("active-workflows", [{ id: "wf-1", label: "Workflow", value: "idle", status: "healthy" }]),
    "monitoring-summary": readyState("monitoring-summary", [{ id: "m-1", label: "monitor-1", value: "1", status: "operational-event" }]),
    "health-summary": readyState("health-summary", [{ id: "h-1", label: "runtime", value: "healthy", status: "FULL" }], "healthy"),
    "diagnostics-summary": readyState("diagnostics-summary", [{ id: "d-1", label: "runtime", value: "info", status: "FULL" }]),
    "evaluation-summary": readyState("evaluation-summary", [{ id: "e-1", label: "evaluator", value: "1/1", status: "passed" }]),
    "authentication-summary": readyState("authentication-summary", [{ id: "s-1", label: "user-1", value: "aal2", status: "mfa" }]),
  };
  return {
    sourceSnapshotId: SNAPSHOT_ID,
    refreshedAt: "2026-07-21T12:00:00.000Z",
    states: { ...defaults, ...overrides },
  };
}

export function uniformRuntime(state: WidgetRuntimeState["state"], reason?: string): WidgetRuntimeSnapshot {
  return {
    states: Object.fromEntries(
      DASHBOARD_WIDGET_IDS.map((widgetId) => [widgetId, { widgetId, state, ...(reason ? { reason } : {}) }]),
    ) as Record<DashboardWidgetId, WidgetRuntimeState>,
  };
}

/** Every widget ready but with zero records. */
export function emptyRuntime(): WidgetRuntimeSnapshot {
  return {
    sourceSnapshotId: SNAPSHOT_ID,
    refreshedAt: "2026-07-21T12:00:00.000Z",
    states: Object.fromEntries(
      DASHBOARD_WIDGET_IDS.map((widgetId) => [widgetId, readyState(widgetId, [])]),
    ) as Record<DashboardWidgetId, WidgetRuntimeState>,
  };
}

export { SNAPSHOT_ID };
