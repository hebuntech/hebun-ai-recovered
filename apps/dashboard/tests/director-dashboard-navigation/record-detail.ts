import assert from "node:assert/strict";
import { createExecutiveOverview } from "../../src/features/director-dashboard-executive-overview";
import {
  createRecordDetailView,
  createSectionListView,
  NAVIGABLE_SECTION_IDS,
  NON_NAVIGABLE_SECTION_IDS,
  UNAVAILABLE_FIELD,
} from "../../src/features/director-dashboard-navigation";
import {
  emptyRuntime,
  healthyRuntime,
  readyState,
  uniformRuntime,
} from "../helpers/director-dashboard-executive-overview";

const evaluatedAt = new Date("2026-07-21T12:01:00.000Z");
const overviewOf = (runtime: Parameters<typeof createExecutiveOverview>[0]["runtime"]) =>
  createExecutiveOverview({ runtime, evaluatedAt });

function firstDetail(runtime: Parameters<typeof createExecutiveOverview>[0]["runtime"], sectionId: string) {
  const overview = overviewOf(runtime);
  const list = createSectionListView({ overview, runtime, sectionId })!;
  const row = list.rows[0]!;
  return { detail: createRecordDetailView({ overview, runtime, sectionId, recordId: row.id }), row, list };
}

/** Every supported record type opens a detail view. */
function everySupportedRecordOpens(): void {
  const runtime = healthyRuntime();
  for (const sectionId of NAVIGABLE_SECTION_IDS) {
    const { detail, row, list } = firstDetail(runtime, sectionId);
    assert.notEqual(detail, undefined, `${sectionId} record must open`);
    assert.equal(detail!.recordId, row.id);
    assert.equal(detail!.displayName, row.label);
    assert.equal(detail!.status, row.status);
    assert.equal(detail!.category, list.label);
    assert.equal(detail!.sectionId, sectionId);
    assert.equal(detail!.authoritative, false);
  }
  assert.equal(NAVIGABLE_SECTION_IDS.length, 6);
}

/** Detail metadata matches the parent list exactly — one snapshot. */
function snapshotConsistencyWithList(): void {
  const runtime = healthyRuntime();
  for (const sectionId of NAVIGABLE_SECTION_IDS) {
    const { detail, list } = firstDetail(runtime, sectionId);
    assert.equal(detail!.sourceSnapshotId, list.sourceSnapshotId);
    assert.equal(detail!.snapshotTimestamp, list.snapshotTimestamp);
    assert.equal(detail!.snapshotFreshness, list.snapshotFreshness);
    assert.equal(detail!.evaluatedAt, list.evaluatedAt);
    assert.equal(detail!.evidenceCount, list.evidenceCount);
    assert.equal(detail!.widgetId, list.widgetId);
  }
  // One snapshot backs every detail across every section.
  const ids = new Set(NAVIGABLE_SECTION_IDS.map((sectionId) => firstDetail(runtime, sectionId).detail!.sourceSnapshotId));
  assert.equal(ids.size, 1);
}

/** Section-specific columns are named from the widget binding contract. */
function fieldsAreLabelledPerSection(): void {
  const runtime = healthyRuntime();
  const expected: Readonly<Record<string, readonly string[]>> = {
    "active-agents": ["Agent ID", "Organization", "Health state"],
    "active-workflows": ["Workflow ID", "Execution status", "Health state"],
    "monitoring-summary": ["Aggregate key", "Signal count", "Signal type"],
    "diagnostics-summary": ["Projection ID", "Severity", "Evidence completeness"],
    "runtime-status": ["Collection", "Item count", "Projection status"],
    "platform-status": ["Snapshot ID", "Health state", "Evidence completeness"],
  };
  for (const [sectionId, labels] of Object.entries(expected)) {
    const { detail } = firstDetail(runtime, sectionId);
    assert.deepEqual(detail!.fields.slice(0, 3).map(({ label }) => label), labels, `${sectionId} labels`);
    // Every section also carries snapshot provenance fields, in stable order.
    assert.deepEqual(
      detail!.fields.slice(3).map(({ key }) => key),
      ["section", "sourceSnapshotId", "snapshotTimestamp", "evaluatedAt"],
    );
  }
}

/** Values the read models carry are shown; absent ones say Unavailable. */
function unavailableFieldsAreNotFabricated(): void {
  const runtime = healthyRuntime();
  const { detail } = firstDetail(runtime, "active-agents");
  // No read model carries a per-record description.
  assert.equal(detail!.description, UNAVAILABLE_FIELD);
  assert.equal(detail!.descriptionAvailable, false);
  for (const entry of detail!.fields) {
    assert.equal(entry.available, entry.value !== UNAVAILABLE_FIELD);
    if (entry.available) assert.notEqual(entry.value.trim(), "");
  }

  // A record whose value column is blank reports Unavailable, not an empty box.
  const blank = healthyRuntime({
    "active-agents": readyState("active-agents", [{ id: "a-1", label: "Agent", value: "", status: "healthy" }]),
  });
  const blankDetail = firstDetail(blank, "active-agents").detail!;
  const organization = blankDetail.fields.find(({ key }) => key === "value")!;
  assert.equal(organization.value, UNAVAILABLE_FIELD);
  assert.equal(organization.available, false);
}

/** Unknown records and unsupported sections resolve to nothing. */
function unsupportedRecordHandling(): void {
  const runtime = healthyRuntime();
  const overview = overviewOf(runtime);
  assert.equal(createRecordDetailView({ overview, runtime, sectionId: "active-agents", recordId: "missing" }), undefined);
  assert.equal(createRecordDetailView({ overview, runtime, sectionId: "not-a-section", recordId: "a" }), undefined);
  for (const sectionId of NON_NAVIGABLE_SECTION_IDS) {
    assert.equal(createRecordDetailView({ overview, runtime, sectionId, recordId: "a" }), undefined,
      `${sectionId} must not open records`);
  }
  // Empty and unavailable sections expose no records to open.
  const empty = emptyRuntime();
  assert.equal(createRecordDetailView({ overview: overviewOf(empty), runtime: empty, sectionId: "active-agents", recordId: "a" }), undefined);
  for (const state of ["unavailable", "failed", "loading"] as const) {
    const broken = uniformRuntime(state);
    assert.equal(
      createRecordDetailView({ overview: overviewOf(broken), runtime: broken, sectionId: "active-agents", recordId: "a" }),
      undefined,
      `${state} widget must not yield a detail view`,
    );
  }
}

/** Detail views are deeply frozen and cannot be mutated. */
function deepFreezeIntegrity(): void {
  const { detail } = firstDetail(healthyRuntime(), "active-agents");
  assert.equal(Object.isFrozen(detail), true);
  assert.equal(Object.isFrozen(detail!.fields), true);
  assert.equal(Object.isFrozen(detail!.fields[0]), true);
  assert.throws(() => {
    (detail as unknown as { displayName: string }).displayName = "tampered";
  });
  assert.throws(() => {
    (detail!.fields as unknown as { push: (value: unknown) => void }).push({});
  });
  assert.throws(() => {
    (detail!.fields[0] as unknown as { value: string }).value = "tampered";
  });
  assert.notEqual(detail!.displayName, "tampered");
  assert.notEqual(detail!.fields[0]?.value, "tampered");
}

/** A new snapshot yields a new detail view; the old one is untouched. */
function refreshCreatesNewDetailWithoutMutatingOld(): void {
  const first = healthyRuntime({
    "active-agents": readyState("active-agents", [{ id: "a-1", label: "Agent", value: "org-1", status: "healthy" }]),
  });
  const before = firstDetail(first, "active-agents").detail!;

  const second = healthyRuntime({
    "active-agents": readyState("active-agents", [{ id: "a-1", label: "Agent", value: "org-1", status: "critical" }]),
  });
  const after = createRecordDetailView({
    overview: overviewOf(second), runtime: second, sectionId: "active-agents", recordId: "a-1",
  })!;

  assert.equal(before.status, "healthy", "the earlier detail must not change");
  assert.equal(after.status, "critical", "the new snapshot must produce new state");
  assert.notDeepEqual(before, after);
  assert.equal(before.fields.find(({ key }) => key === "status")?.value, "healthy");
  assert.equal(after.fields.find(({ key }) => key === "status")?.value, "critical");
}

/** Building a detail must not disturb the snapshot it reads. */
function readingIsSideEffectFree(): void {
  const runtime = healthyRuntime();
  const before = runtime.states["active-agents"].viewModel?.items.length;
  const overview = overviewOf(runtime);
  const listBefore = createSectionListView({ overview, runtime, sectionId: "active-agents" })!;
  firstDetail(runtime, "active-agents");
  const listAfter = createSectionListView({ overview, runtime, sectionId: "active-agents" })!;
  assert.equal(runtime.states["active-agents"].viewModel?.items.length, before);
  assert.deepEqual(listAfter.rows, listBefore.rows);
}

function main(): void {
  everySupportedRecordOpens();
  snapshotConsistencyWithList();
  fieldsAreLabelledPerSection();
  unavailableFieldsAreNotFabricated();
  unsupportedRecordHandling();
  deepFreezeIntegrity();
  refreshCreatesNewDetailWithoutMutatingOld();
  readingIsSideEffectFree();
  console.log("dashboard record detail checks passed");
}

main();
