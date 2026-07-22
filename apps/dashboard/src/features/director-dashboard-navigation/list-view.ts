import type { ExecutiveOverview } from "../director-dashboard-executive-overview";
import type {
  WidgetDisplayItem,
  WidgetRuntimeSnapshot,
} from "../director-dashboard-widget-runtime";
import { findNavigationTarget } from "./navigation";
import type {
  ListSortDirection,
  ListSortField,
  SectionListQuery,
  SectionListRow,
  SectionListView,
} from "./types";
import { deepFreeze } from "./validation";

const DEFAULT_SORT_FIELD: ListSortField = "label";
const DEFAULT_SORT_DIRECTION: ListSortDirection = "asc";

/** Records carry no status of their own for count-only widgets. */
function rowOf(item: WidgetDisplayItem): SectionListRow {
  return { id: item.id, label: item.label, value: item.value, status: item.status ?? "unknown" };
}

function matchesSearch(row: SectionListRow, search: string): boolean {
  const needle = search.trim().toLowerCase();
  if (needle === "") return true;
  return row.label.toLowerCase().includes(needle) ||
    row.value.toLowerCase().includes(needle) ||
    row.status.toLowerCase().includes(needle);
}

/**
 * Deterministic ordering: the chosen field, then always the record id as a
 * tie-break, so the same snapshot and query can never produce two orders.
 */
function compareRows(left: SectionListRow, right: SectionListRow, field: ListSortField, direction: ListSortDirection): number {
  const primary = left[field].localeCompare(right[field]);
  const ordered = direction === "asc" ? primary : -primary;
  return ordered !== 0 ? ordered : left.id.localeCompare(right.id);
}

/**
 * Builds the read-only record list behind one dashboard section.
 *
 * Reads only the widget runtime view model the Executive Overview was derived
 * from — the same immutable snapshot, never a fresh query. The result is
 * deep-frozen: a list is replaced by refreshing the dashboard, never mutated.
 */
export function createSectionListView(input: {
  readonly overview: ExecutiveOverview;
  readonly runtime: WidgetRuntimeSnapshot;
  readonly sectionId: string;
  readonly query?: SectionListQuery;
}): SectionListView | undefined {
  const target = findNavigationTarget({ overview: input.overview, runtime: input.runtime, sectionId: input.sectionId });
  if (!target) return undefined;

  const query = input.query ?? {};
  const sortField = query.sortField ?? DEFAULT_SORT_FIELD;
  const sortDirection = query.sortDirection ?? DEFAULT_SORT_DIRECTION;
  const viewModel = input.runtime.states[target.widgetId]?.viewModel;
  const source = target.state === "available" && viewModel ? viewModel.items : [];

  const all = source.map(rowOf);
  const statusFacets = [...new Set(all.map(({ status }) => status))].sort((left, right) => left.localeCompare(right));
  const rows = all
    .filter((row) => (query.status === undefined || query.status === "" ? true : row.status === query.status))
    .filter((row) => matchesSearch(row, query.search ?? ""))
    .sort((left, right) => compareRows(left, right, sortField, sortDirection));

  return deepFreeze({
    sectionId: target.sectionId,
    widgetId: target.widgetId,
    label: target.label,
    state: target.state,
    rows,
    totalCount: all.length,
    evidenceCount: target.recordCount,
    statusFacets,
    query: { ...query, sortField, sortDirection },
    ...(target.sourceSnapshotId ? { sourceSnapshotId: target.sourceSnapshotId } : {}),
    ...(input.overview.freshness.refreshedAt ? { snapshotTimestamp: input.overview.freshness.refreshedAt } : {}),
    snapshotFreshness: input.overview.freshness.state,
    evaluatedAt: input.overview.evaluatedAt,
    authoritative: false as const,
  });
}
