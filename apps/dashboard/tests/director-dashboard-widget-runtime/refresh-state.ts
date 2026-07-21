import assert from "node:assert/strict";
import { createDashboardSnapshot } from "../../src/features/director-dashboard-data";
import { createDefaultWidgetRegistry, WidgetRefreshEngine } from "../../src/features/director-dashboard-widget-runtime";
import { dashboardRegistry, dashboardSource, tenantScope } from "../helpers/director-dashboard-data";

function snapshot(at: string, empty = false) {
  const source = empty ? dashboardSource({
    runtimeSnapshots: [], workflows: [], monitoringAggregates: [], healthSnapshots: [], diagnosticsProjections: [], evaluationSummaries: [], authenticationSessions: [],
    organization: { ...dashboardSource().organization, agents: [] },
  }) : dashboardSource();
  const result = createDashboardSnapshot({ registry: dashboardRegistry(), source, authorityScope: tenantScope, projectionVersion: "1.0.0", generatedAt: new Date(at) });
  if (result.status !== "success") throw new Error("fixture unavailable");
  return result.snapshot;
}

function main(): void {
  const engine = new WidgetRefreshEngine(createDefaultWidgetRegistry(), "1.0.0");
  assert.equal(engine.current().states["runtime-overview"].state, "unavailable");
  assert.equal(engine.beginRefresh().states["active-agents"].state, "loading");
  const first = engine.manualRefresh({ snapshot: snapshot("2026-07-21T12:30:00.000Z"), authorityScope: tenantScope });
  assert.equal(first.states["runtime-overview"].state, "ready");
  assert.equal(Object.isFrozen(first), true);
  const replay = engine.manualRefresh({ snapshot: snapshot("2026-07-21T12:30:00.000Z"), authorityScope: tenantScope });
  assert.deepEqual(replay, first);
  const switched = engine.switchSnapshot({ snapshot: snapshot("2026-07-21T13:30:00.000Z"), authorityScope: tenantScope });
  assert.notEqual(switched.sourceSnapshotId, first.sourceSnapshotId);
  assert.equal(switched.states["active-workflows"].viewModel?.sourceSnapshotId, switched.sourceSnapshotId);
  const empty = engine.manualRefresh({ snapshot: snapshot("2026-07-21T14:30:00.000Z", true), authorityScope: tenantScope });
  assert.equal(Object.values(empty.states).every(({ state }) => state === "empty"), true);
  const unavailable = engine.manualRefresh({ authorityScope: tenantScope });
  assert.equal(Object.values(unavailable.states).every(({ state }) => state === "unavailable"), true);
  console.log("director dashboard widget refresh and state checks passed");
}

main();
