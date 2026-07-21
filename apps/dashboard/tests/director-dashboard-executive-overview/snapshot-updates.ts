import assert from "node:assert/strict";
import { createDashboardSnapshot } from "../../src/features/director-dashboard-data";
import {
  createDefaultWidgetRegistry,
  WidgetRefreshEngine,
} from "../../src/features/director-dashboard-widget-runtime";
import { createExecutiveOverview } from "../../src/features/director-dashboard-executive-overview";
import { dashboardRegistry, dashboardSource, tenantScope } from "../helpers/director-dashboard-data";

const evaluatedAt = new Date("2026-07-21T12:01:00.000Z");

function snapshotAt(generatedAt: string, overrides: Parameters<typeof dashboardSource>[0] = {}) {
  const result = createDashboardSnapshot({
    registry: dashboardRegistry(),
    source: dashboardSource(overrides),
    authorityScope: tenantScope,
    projectionVersion: "1.0.0",
    generatedAt: new Date(generatedAt),
  });
  assert.equal(result.status, "success");
  return result.status === "success" ? result.snapshot : undefined!;
}

/**
 * The Executive Overview must refresh together with the widget runtime
 * snapshot: it is derived from the runtime snapshot alone, so a runtime
 * refresh always produces a matching overview.
 */
function tracksWidgetRuntimeRefresh(): void {
  const engine = new WidgetRefreshEngine(createDefaultWidgetRegistry(), "1.0.0");

  const beforeAnyRefresh = createExecutiveOverview({ runtime: engine.current(), evaluatedAt });
  assert.equal(beforeAnyRefresh.organizationHealth, "unavailable");
  assert.equal(beforeAnyRefresh.freshness.state, "unknown");

  const first = snapshotAt("2026-07-21T12:00:00.000Z");
  const firstOverview = createExecutiveOverview({ runtime: engine.manualRefresh({ snapshot: first, authorityScope: tenantScope }), evaluatedAt });
  assert.equal(firstOverview.freshness.sourceSnapshotId, first.snapshotId);
  assert.equal(firstOverview.freshness.refreshedAt, first.generatedAt);
  assert.equal(firstOverview.freshness.state, "fresh");
  assert.equal(firstOverview.unavailableCount, 0);

  const loadingOverview = createExecutiveOverview({ runtime: engine.beginRefresh(), evaluatedAt });
  assert.equal(loadingOverview.organizationHealth, "unknown");
  for (const section of loadingOverview.sections) assert.equal(section.reasonCode, "SECTION_LOADING");

  const second = snapshotAt("2026-07-21T12:00:30.000Z");
  const secondOverview = createExecutiveOverview({ runtime: engine.switchSnapshot({ snapshot: second, authorityScope: tenantScope }), evaluatedAt });
  assert.notEqual(secondOverview.freshness.sourceSnapshotId, firstOverview.freshness.sourceSnapshotId);
  assert.equal(secondOverview.freshness.sourceSnapshotId, second.snapshotId);
  assert.notEqual(secondOverview.overviewId, firstOverview.overviewId);
  assert.deepEqual(
    secondOverview.sections.map((section) => [section.sectionId, section.health]),
    firstOverview.sections.map((section) => [section.sectionId, section.health]),
  );
}

/** Losing the snapshot must degrade to unavailable, never to a stale verdict. */
function degradesWhenSnapshotDisappears(): void {
  const engine = new WidgetRefreshEngine(createDefaultWidgetRegistry(), "1.0.0");
  const snapshot = snapshotAt("2026-07-21T12:00:00.000Z");
  const ready = createExecutiveOverview({ runtime: engine.manualRefresh({ snapshot, authorityScope: tenantScope }), evaluatedAt });
  assert.equal(ready.unavailableCount, 0);

  const lost = createExecutiveOverview({ runtime: engine.manualRefresh({ authorityScope: tenantScope }), evaluatedAt });
  assert.equal(lost.organizationHealth, "unavailable");
  assert.equal(lost.unavailableCount, lost.sections.length);
  assert.equal(lost.freshness.state, "unknown");
  assert.equal(lost.freshness.sourceSnapshotId, undefined);
}

/** A degraded source must move the overview off healthy on the next refresh. */
function reflectsSourceHealthChange(): void {
  const engine = new WidgetRefreshEngine(createDefaultWidgetRegistry(), "1.0.0");
  const healthy = snapshotAt("2026-07-21T12:00:00.000Z");
  const healthyOverview = createExecutiveOverview({ runtime: engine.manualRefresh({ snapshot: healthy, authorityScope: tenantScope }), evaluatedAt });
  const platformBefore = healthyOverview.sections.find((section) => section.sectionId === "platform-status");
  assert.equal(platformBefore?.health, "healthy");

  const base = dashboardSource();
  const degraded = snapshotAt("2026-07-21T12:00:30.000Z", {
    healthSnapshots: base.healthSnapshots.map((item) => ({ ...item, state: "critical" as const, severity: "critical" as const })),
  });
  const degradedOverview = createExecutiveOverview({ runtime: engine.switchSnapshot({ snapshot: degraded, authorityScope: tenantScope }), evaluatedAt });
  const platformAfter = degradedOverview.sections.find((section) => section.sectionId === "platform-status");
  assert.equal(platformAfter?.health, "critical");
  assert.equal(degradedOverview.organizationHealth, "critical");
  assert.equal(degradedOverview.criticalAlertCount >= 1, true);
  assert.equal(degradedOverview.sections[0]?.sectionId, "platform-status");
}

tracksWidgetRuntimeRefresh();
degradesWhenSnapshotDisappears();
reflectsSourceHealthChange();
console.log("executive overview snapshot update checks passed");
