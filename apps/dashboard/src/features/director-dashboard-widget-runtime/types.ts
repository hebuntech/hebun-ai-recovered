import type {
  DashboardAuthorityScope,
  DashboardReadModels,
  DashboardSectionId,
  DashboardSnapshot,
} from "../director-dashboard-data";

export const DASHBOARD_WIDGET_IDS = [
  "runtime-overview", "active-agents", "active-workflows", "monitoring-summary",
  "health-summary", "diagnostics-summary", "evaluation-summary", "authentication-summary",
] as const;

export type DashboardWidgetId = (typeof DASHBOARD_WIDGET_IDS)[number];
export type WidgetRefreshStrategy = "manual" | "snapshot-switch";
export type WidgetLoadingStrategy = "eager" | "deferred";
export type WidgetState = "loading" | "ready" | "empty" | "unavailable" | "failed";
export type DashboardReadModelKey = keyof DashboardReadModels;

export interface DashboardWidgetDefinition {
  readonly widgetId: DashboardWidgetId;
  readonly version: string;
  readonly sectionId: DashboardSectionId;
  readonly readModel: DashboardReadModelKey;
  readonly refreshStrategy: WidgetRefreshStrategy;
  readonly loadingStrategy: WidgetLoadingStrategy;
}

export interface WidgetDisplayItem {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly status?: string;
}

export interface WidgetViewModel {
  readonly widgetId: DashboardWidgetId;
  readonly sourceSnapshotId: string;
  readonly title: string;
  readonly primaryValue: string;
  readonly displayStatus: string;
  readonly items: readonly WidgetDisplayItem[];
  readonly authoritative: false;
}

export type WidgetBindingResult =
  | { readonly state: "ready"; readonly viewModel: WidgetViewModel }
  | { readonly state: "empty"; readonly viewModel: WidgetViewModel }
  | { readonly state: "unavailable"; readonly reason: string }
  | { readonly state: "failed"; readonly reason: "WIDGET_BINDING_FAILED" };

export interface WidgetRuntimeState {
  readonly widgetId: DashboardWidgetId;
  readonly state: WidgetState;
  readonly viewModel?: WidgetViewModel;
  readonly reason?: string;
}

export interface WidgetRuntimeSnapshot {
  readonly sourceSnapshotId?: string;
  readonly refreshedAt?: string;
  readonly states: Readonly<Record<DashboardWidgetId, WidgetRuntimeState>>;
}

export interface WidgetRefreshRequest {
  readonly snapshot?: DashboardSnapshot;
  readonly authorityScope: DashboardAuthorityScope;
}
