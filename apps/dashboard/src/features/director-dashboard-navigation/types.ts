import type {
  ExecutiveHealthState,
  ExecutiveSectionId,
} from "../director-dashboard-executive-overview";
import type { DashboardWidgetId, WidgetDisplayItem } from "../director-dashboard-widget-runtime";

/** Sections that can be opened as a read-only record list. */
export const NAVIGABLE_SECTION_IDS = [
  "platform-status",
  "runtime-status",
  "active-agents",
  "active-workflows",
  "monitoring-summary",
  "diagnostics-summary",
] as const;

export type NavigableSectionId = (typeof NAVIGABLE_SECTION_IDS)[number];

/**
 * Sections deliberately left without drill-down until a producer exists.
 * Opening them is not an error — there is simply nothing to explore.
 */
export const NON_NAVIGABLE_SECTION_IDS = [
  "evaluation-summary",
  "authentication-summary",
] as const;

export type NavigationTargetState = "available" | "empty" | "unavailable" | "unsupported";

export interface NavigationTarget {
  readonly sectionId: ExecutiveSectionId;
  readonly widgetId: DashboardWidgetId;
  readonly label: string;
  readonly health: ExecutiveHealthState;
  readonly recordCount: number;
  readonly state: NavigationTargetState;
  /** Snapshot the target was derived from. Absent when nothing was readable. */
  readonly sourceSnapshotId?: string;
}

export type ListSortField = "label" | "value" | "status";
export type ListSortDirection = "asc" | "desc";

export interface SectionListQuery {
  readonly search?: string;
  readonly status?: string;
  readonly sortField?: ListSortField;
  readonly sortDirection?: ListSortDirection;
}

export interface SectionListRow extends WidgetDisplayItem {
  readonly status: string;
}

export interface SectionListView {
  readonly sectionId: ExecutiveSectionId;
  readonly widgetId: DashboardWidgetId;
  readonly label: string;
  readonly state: NavigationTargetState;
  readonly rows: readonly SectionListRow[];
  /** Records available before search/filter, for honest counting. */
  readonly totalCount: number;
  readonly evidenceCount: number;
  /** Distinct status values present in the unfiltered records. */
  readonly statusFacets: readonly string[];
  readonly query: Required<Pick<SectionListQuery, "sortField" | "sortDirection">> & SectionListQuery;
  readonly sourceSnapshotId?: string;
  readonly snapshotTimestamp?: string;
  readonly snapshotFreshness: "fresh" | "stale" | "unknown";
  readonly evaluatedAt: string;
  readonly authoritative: false;
}
