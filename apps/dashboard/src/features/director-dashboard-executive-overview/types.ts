import type { DashboardWidgetId } from "../director-dashboard-widget-runtime";

/**
 * Canonical executive health states. Ordered here from best to worst for
 * documentation purposes only; the authoritative ordering lives in
 * `HEALTH_SEVERITY_RANK`.
 */
export const EXECUTIVE_HEALTH_STATES = ["healthy", "unknown", "warning", "unavailable", "critical"] as const;

export type ExecutiveHealthState = (typeof EXECUTIVE_HEALTH_STATES)[number];

/** Deterministic freshness classification of the widget runtime snapshot. */
export const EXECUTIVE_FRESHNESS_STATES = ["fresh", "stale", "unknown"] as const;

export type ExecutiveFreshnessState = (typeof EXECUTIVE_FRESHNESS_STATES)[number];

export const EXECUTIVE_SECTION_IDS = [
  "platform-status",
  "runtime-status",
  "active-agents",
  "active-workflows",
  "monitoring-summary",
  "diagnostics-summary",
  "evaluation-summary",
  "authentication-summary",
] as const;

export type ExecutiveSectionId = (typeof EXECUTIVE_SECTION_IDS)[number];

export interface ExecutiveSection {
  readonly sectionId: ExecutiveSectionId;
  readonly widgetId: DashboardWidgetId;
  readonly label: string;
  readonly health: ExecutiveHealthState;
  /** Canonical widget runtime state this section was derived from. */
  readonly sourceState: "loading" | "ready" | "empty" | "unavailable" | "failed";
  /** Number of records the underlying widget reported. Zero when not readable. */
  readonly recordCount: number;
  /** Stable machine-readable reason code. Never free-form runtime detail. */
  readonly reasonCode: ExecutiveReasonCode;
}

export const EXECUTIVE_REASON_CODES = [
  "SECTION_HEALTHY",
  "SECTION_WARNING",
  "SECTION_CRITICAL",
  "SECTION_UNKNOWN",
  "SECTION_EMPTY",
  "SECTION_LOADING",
  "SECTION_UNAVAILABLE",
] as const;

export type ExecutiveReasonCode = (typeof EXECUTIVE_REASON_CODES)[number];

export interface ExecutiveFreshness {
  readonly state: ExecutiveFreshnessState;
  readonly refreshedAt?: string;
  readonly ageSeconds?: number;
  readonly sourceSnapshotId?: string;
}

export interface ExecutiveOverview {
  readonly overviewId: string;
  readonly evaluatedAt: string;
  /** Worst health across every section — answers "is the company healthy?". */
  readonly organizationHealth: ExecutiveHealthState;
  /** Sections ordered by descending priority, deterministically. */
  readonly sections: readonly ExecutiveSection[];
  readonly criticalAlertCount: number;
  readonly warningCount: number;
  readonly unavailableCount: number;
  readonly freshness: ExecutiveFreshness;
  readonly authoritative: false;
}

export interface ExecutiveOverviewInput {
  readonly runtime: import("../director-dashboard-widget-runtime").WidgetRuntimeSnapshot;
  readonly evaluatedAt: Date;
  /** Seconds after which a runtime snapshot is classified as stale. */
  readonly freshnessThresholdSeconds?: number;
}
