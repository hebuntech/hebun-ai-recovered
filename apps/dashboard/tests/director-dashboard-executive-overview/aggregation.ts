import assert from "node:assert/strict";
import {
  createExecutiveOverview,
  EXECUTIVE_SECTION_IDS,
} from "../../src/features/director-dashboard-executive-overview";
import { emptyRuntime, healthyRuntime, readyState, SNAPSHOT_ID, uniformRuntime } from "../helpers/director-dashboard-executive-overview";

const evaluatedAt = new Date("2026-07-21T12:01:00.000Z");

function healthyOverview() {
  return createExecutiveOverview({ runtime: healthyRuntime(), evaluatedAt });
}

function coversEverySection(): void {
  const overview = healthyOverview();
  assert.equal(overview.sections.length, EXECUTIVE_SECTION_IDS.length);
  assert.deepEqual(
    [...overview.sections.map((section) => section.sectionId)].sort(),
    [...EXECUTIVE_SECTION_IDS].sort(),
  );
}

function summarizesWithoutInventingData(): void {
  const overview = healthyOverview();
  assert.equal(overview.organizationHealth, "healthy");
  assert.equal(overview.criticalAlertCount, 0);
  assert.equal(overview.warningCount, 0);
  assert.equal(overview.unavailableCount, 0);
  assert.equal(overview.authoritative, false);
  for (const section of overview.sections) assert.equal(section.recordCount, 1);
  assert.equal(overview.freshness.state, "fresh");
  assert.equal(overview.freshness.ageSeconds, 60);
  assert.equal(overview.freshness.sourceSnapshotId, SNAPSHOT_ID);
  assert.equal(overview.overviewId, `executive-overview-${SNAPSHOT_ID}-2026-07-21T12:01:00.000Z`);
}

function isDeeplyImmutable(): void {
  const overview = healthyOverview();
  assert.equal(Object.isFrozen(overview), true);
  assert.equal(Object.isFrozen(overview.sections), true);
  assert.equal(Object.isFrozen(overview.sections[0]), true);
  assert.equal(Object.isFrozen(overview.freshness), true);
  assert.throws(() => {
    (overview.sections as unknown as { push: (value: unknown) => void }).push({});
  });
}

function isDeterministic(): void {
  const left = healthyOverview();
  const right = createExecutiveOverview({ runtime: healthyRuntime(), evaluatedAt });
  assert.deepEqual(left, right);
}

function countsSeverities(): void {
  const overview = createExecutiveOverview({
    runtime: healthyRuntime({
      "health-summary": readyState("health-summary", [{ id: "h-1", label: "runtime", value: "critical", status: "FULL" }], "critical"),
      "diagnostics-summary": readyState("diagnostics-summary", [{ id: "d-1", label: "runtime", value: "error", status: "FULL" }]),
      "active-agents": readyState("active-agents", [{ id: "a-1", label: "Agent", value: "org", status: "watch" }]),
      "active-workflows": { widgetId: "active-workflows", state: "unavailable", reason: "DASHBOARD_SNAPSHOT_UNAVAILABLE" },
    }),
    evaluatedAt,
  });
  assert.equal(overview.criticalAlertCount, 2);
  assert.equal(overview.warningCount, 1);
  assert.equal(overview.unavailableCount, 1);
  assert.equal(overview.organizationHealth, "critical");
}

function reportsFreshnessStates(): void {
  const stale = createExecutiveOverview({ runtime: healthyRuntime(), evaluatedAt: new Date("2026-07-21T12:10:00.000Z") });
  assert.equal(stale.freshness.state, "stale");
  assert.equal(stale.freshness.ageSeconds, 600);

  const threshold = createExecutiveOverview({ runtime: healthyRuntime(), evaluatedAt, freshnessThresholdSeconds: 30 });
  assert.equal(threshold.freshness.state, "stale");

  const noRefresh = createExecutiveOverview({ runtime: uniformRuntime("unavailable"), evaluatedAt });
  assert.equal(noRefresh.freshness.state, "unknown");
  assert.equal(noRefresh.freshness.ageSeconds, undefined);

  const skewed = createExecutiveOverview({ runtime: healthyRuntime(), evaluatedAt: new Date("2026-07-21T11:00:00.000Z") });
  assert.equal(skewed.freshness.state, "unknown");

  const invalid = createExecutiveOverview({ runtime: healthyRuntime(), evaluatedAt: new Date("not-a-date") });
  assert.equal(invalid.freshness.state, "unknown");
  assert.equal(invalid.evaluatedAt, "");
}

function reportsEmptyState(): void {
  const overview = createExecutiveOverview({ runtime: emptyRuntime(), evaluatedAt });
  assert.equal(overview.organizationHealth, "unknown");
  assert.equal(overview.criticalAlertCount, 0);
  for (const section of overview.sections) {
    assert.equal(section.health, "unknown");
    assert.equal(section.sourceState, "empty");
    assert.equal(section.reasonCode, "SECTION_EMPTY");
    assert.equal(section.recordCount, 0);
  }
}

function reportsUnavailableState(): void {
  for (const state of ["unavailable", "failed"] as const) {
    const overview = createExecutiveOverview({ runtime: uniformRuntime(state, "DASHBOARD_SNAPSHOT_UNAVAILABLE"), evaluatedAt });
    assert.equal(overview.organizationHealth, "unavailable");
    assert.equal(overview.unavailableCount, overview.sections.length);
    assert.equal(overview.criticalAlertCount, 0);
    assert.equal(overview.overviewId.includes("unavailable"), true);
    for (const section of overview.sections) {
      assert.equal(section.reasonCode, "SECTION_UNAVAILABLE");
      assert.equal(section.recordCount, 0);
    }
  }
}

function reportsLoadingState(): void {
  const overview = createExecutiveOverview({ runtime: uniformRuntime("loading"), evaluatedAt });
  assert.equal(overview.organizationHealth, "unknown");
  for (const section of overview.sections) assert.equal(section.reasonCode, "SECTION_LOADING");
}

coversEverySection();
summarizesWithoutInventingData();
isDeeplyImmutable();
isDeterministic();
countsSeverities();
reportsFreshnessStates();
reportsEmptyState();
reportsUnavailableState();
reportsLoadingState();
console.log("executive overview aggregation checks passed");
