import assert from "node:assert/strict";
import { createExecutiveOverview } from "../../src/features/director-dashboard-executive-overview";
import {
  createNavigationTargets,
  createSectionListView,
  findNavigationTarget,
  isNavigableSection,
  NAVIGABLE_SECTION_IDS,
  NON_NAVIGABLE_SECTION_IDS,
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

/** Every overview section gets a target, in the overview's priority order. */
function targetsCoverEverySection(): void {
  const runtime = healthyRuntime();
  const overview = overviewOf(runtime);
  const targets = createNavigationTargets({ overview, runtime });
  assert.equal(targets.length, overview.sections.length);
  assert.deepEqual(
    targets.map(({ sectionId }) => sectionId),
    overview.sections.map(({ sectionId }) => sectionId),
    "navigation order must mirror the overview's priority order",
  );
  for (const target of targets) {
    const section = overview.sections.find((candidate) => candidate.sectionId === target.sectionId)!;
    assert.equal(target.label, section.label);
    assert.equal(target.health, section.health);
    assert.equal(target.recordCount, section.recordCount);
    assert.equal(target.widgetId, section.widgetId);
  }
}

/** The six supported sections open; the two without producers do not. */
function supportedSectionsAreNavigable(): void {
  const runtime = healthyRuntime();
  const targets = createNavigationTargets({ overview: overviewOf(runtime), runtime });
  for (const sectionId of NAVIGABLE_SECTION_IDS) {
    assert.equal(isNavigableSection(sectionId), true);
    assert.equal(targets.find((target) => target.sectionId === sectionId)?.state, "available");
  }
  for (const sectionId of NON_NAVIGABLE_SECTION_IDS) {
    assert.equal(isNavigableSection(sectionId), false);
    assert.equal(targets.find((target) => target.sectionId === sectionId)?.state, "unsupported");
  }
  assert.equal(NAVIGABLE_SECTION_IDS.length, 6);
}

/** Unknown sections resolve to nothing rather than throwing. */
function unsupportedSectionHandling(): void {
  const runtime = healthyRuntime();
  const overview = overviewOf(runtime);
  assert.equal(findNavigationTarget({ overview, runtime, sectionId: "not-a-section" }), undefined);
  assert.equal(createSectionListView({ overview, runtime, sectionId: "not-a-section" }), undefined);

  // A section without a producer opens to an explicitly unsupported list.
  const evaluation = createSectionListView({ overview, runtime, sectionId: "evaluation-summary" })!;
  assert.equal(evaluation.state, "unsupported");
  assert.equal(evaluation.rows.length, 0);
  assert.equal(evaluation.totalCount, 0);
}

/** Empty and unavailable producers stay distinct. */
function emptyAndUnavailableStates(): void {
  const empty = emptyRuntime();
  const emptyView = createSectionListView({ overview: overviewOf(empty), runtime: empty, sectionId: "active-agents" })!;
  assert.equal(emptyView.state, "empty");
  assert.equal(emptyView.rows.length, 0);

  for (const state of ["unavailable", "failed", "loading"] as const) {
    const runtime = uniformRuntime(state);
    const view = createSectionListView({ overview: overviewOf(runtime), runtime, sectionId: "active-agents" })!;
    assert.equal(view.state, "unavailable", `${state} widget must not offer records`);
    assert.equal(view.rows.length, 0);
  }
}

/** The list is built from the same snapshot the overview was derived from. */
function snapshotIdentity(): void {
  const runtime = healthyRuntime();
  const overview = overviewOf(runtime);
  const view = createSectionListView({ overview, runtime, sectionId: "active-agents" })!;
  assert.equal(view.sourceSnapshotId, runtime.states["active-agents"].viewModel?.sourceSnapshotId);
  assert.equal(view.snapshotTimestamp, overview.freshness.refreshedAt);
  assert.equal(view.snapshotFreshness, overview.freshness.state);
  assert.equal(view.evaluatedAt, overview.evaluatedAt);
  assert.equal(view.authoritative, false);
  // Every navigable section in one snapshot shares that snapshot id.
  const ids = new Set(NAVIGABLE_SECTION_IDS
    .map((sectionId) => createSectionListView({ overview, runtime, sectionId })!.sourceSnapshotId));
  assert.equal(ids.size, 1, "one snapshot must back every list");
}

/** Refreshing produces a new snapshot and therefore a new list. */
function refreshProducesNewList(): void {
  const first = healthyRuntime();
  const firstView = createSectionListView({ overview: overviewOf(first), runtime: first, sectionId: "active-agents" })!;

  const second = healthyRuntime({
    "active-agents": readyState("active-agents", [
      { id: "agent-1", label: "Agent", value: "org-1", status: "healthy" },
      { id: "agent-2", label: "Second Agent", value: "org-1", status: "critical" },
    ]),
  });
  const secondView = createSectionListView({ overview: overviewOf(second), runtime: second, sectionId: "active-agents" })!;

  assert.equal(firstView.totalCount, 1);
  assert.equal(secondView.totalCount, 2, "the new snapshot must yield a new list");
  assert.notDeepEqual(firstView.rows, secondView.rows);
  // The earlier list was not mutated by building the newer one.
  assert.equal(firstView.rows.length, 1);
  assert.equal(firstView.rows[0]?.id, "agent-1");
}

/** Lists are deeply immutable. */
function listsAreImmutable(): void {
  const runtime = healthyRuntime();
  const view = createSectionListView({ overview: overviewOf(runtime), runtime, sectionId: "active-agents" })!;
  assert.equal(Object.isFrozen(view), true);
  assert.equal(Object.isFrozen(view.rows), true);
  assert.equal(Object.isFrozen(view.rows[0]), true);
  assert.equal(Object.isFrozen(view.statusFacets), true);
  assert.throws(() => {
    (view.rows as unknown as { push: (value: unknown) => void }).push({});
  });
  assert.throws(() => {
    (view.rows[0] as unknown as { label: string }).label = "tampered";
  });
  assert.notEqual(view.rows[0]?.label, "tampered");
  // Building a list must not disturb the runtime snapshot it read.
  assert.equal(runtime.states["active-agents"].viewModel?.items.length, 1);
}

function main(): void {
  targetsCoverEverySection();
  supportedSectionsAreNavigable();
  unsupportedSectionHandling();
  emptyAndUnavailableStates();
  snapshotIdentity();
  refreshProducesNewList();
  listsAreImmutable();
  console.log("dashboard navigation checks passed");
}

main();
