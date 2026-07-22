import type { ExecutiveOverview } from "../director-dashboard-executive-overview";
import type { WidgetRuntimeSnapshot } from "../director-dashboard-widget-runtime";
import { createSectionListView } from "./list-view";
import {
  UNAVAILABLE_FIELD,
  type NavigableSectionId,
  type RecordDetailField,
  type RecordDetailView,
  type SectionListRow,
  type SectionListView,
} from "./types";
import { deepFreeze } from "./validation";

/**
 * What the widget runtime's generic `value` and `status` columns actually mean
 * for each section, taken from the widget binding contract. Naming them here
 * reads existing meaning; it never adds data the read models do not carry.
 */
const FIELD_LABELS: Readonly<Record<NavigableSectionId, {
  readonly identity: string;
  readonly value: string;
  readonly status: string;
}>> = Object.freeze({
  "runtime-status": Object.freeze({ identity: "Collection", value: "Item count", status: "Projection status" }),
  "active-agents": Object.freeze({ identity: "Agent ID", value: "Organization", status: "Health state" }),
  "active-workflows": Object.freeze({ identity: "Workflow ID", value: "Execution status", status: "Health state" }),
  "monitoring-summary": Object.freeze({ identity: "Aggregate key", value: "Signal count", status: "Signal type" }),
  "platform-status": Object.freeze({ identity: "Snapshot ID", value: "Health state", status: "Evidence completeness" }),
  "diagnostics-summary": Object.freeze({ identity: "Projection ID", value: "Severity", status: "Evidence completeness" }),
});

function field(key: string, label: string, value: string | undefined): RecordDetailField {
  const available = value !== undefined && value.trim() !== "";
  return { key, label, value: available ? value : UNAVAILABLE_FIELD, available };
}

function detailFields(sectionId: NavigableSectionId, row: SectionListRow, list: SectionListView): readonly RecordDetailField[] {
  const labels = FIELD_LABELS[sectionId];
  return [
    field("identity", labels.identity, row.id),
    field("value", labels.value, row.value),
    field("status", labels.status, row.status),
    field("section", "Section", list.label),
    field("sourceSnapshotId", "Source snapshot", list.sourceSnapshotId),
    field("snapshotTimestamp", "Snapshot timestamp", list.snapshotTimestamp),
    field("evaluatedAt", "Evaluated at", list.evaluatedAt),
  ];
}

/**
 * Builds the read-only detail view for one record.
 *
 * Derived from the same section list — and therefore the same immutable
 * snapshot — that the record was opened from. It performs no query, no fetch,
 * and no runtime access; if the record is not in that snapshot the result is
 * undefined rather than a live lookup.
 */
export function createRecordDetailView(input: {
  readonly overview: ExecutiveOverview;
  readonly runtime: WidgetRuntimeSnapshot;
  readonly sectionId: string;
  readonly recordId: string;
}): RecordDetailView | undefined {
  const list = createSectionListView({
    overview: input.overview,
    runtime: input.runtime,
    sectionId: input.sectionId,
  });
  if (!list || list.state !== "available") return undefined;
  const row = list.rows.find((candidate) => candidate.id === input.recordId);
  if (!row) return undefined;

  return deepFreeze({
    sectionId: list.sectionId,
    widgetId: list.widgetId,
    category: list.label,
    recordId: row.id,
    displayName: row.label,
    status: row.status,
    // No read model carries a per-record description, so it is reported as
    // unavailable rather than filled with a substitute.
    description: UNAVAILABLE_FIELD,
    descriptionAvailable: false,
    fields: detailFields(list.sectionId as NavigableSectionId, row, list),
    evidenceCount: list.evidenceCount,
    ...(list.sourceSnapshotId ? { sourceSnapshotId: list.sourceSnapshotId } : {}),
    ...(list.snapshotTimestamp ? { snapshotTimestamp: list.snapshotTimestamp } : {}),
    snapshotFreshness: list.snapshotFreshness,
    evaluatedAt: list.evaluatedAt,
    authoritative: false as const,
  });
}
