import assert from "node:assert/strict";
import { createDashboardSnapshot, replayDashboardSnapshot } from "../../src/features/director-dashboard-data";
import { dashboardRegistry, dashboardSource, tenantScope } from "../helpers/director-dashboard-data";

function main(): void {
  const input = { registry: dashboardRegistry(), source: dashboardSource(), authorityScope: tenantScope, projectionVersion: "1.0.0", generatedAt: new Date("2026-07-21T12:30:00.000Z") };
  const result = createDashboardSnapshot(input);
  assert.equal(result.status, "success");
  if (result.status !== "success") return;
  assert.equal(result.snapshot.authoritative, false);
  assert.equal(result.snapshot.completeness, "FULL");
  assert.equal(result.snapshot.models.runtimeOverview.length, 1);
  assert.equal(result.snapshot.models.agentOverview[0]?.agentId, "agent-1");
  assert.equal(result.snapshot.models.workflowOverview[0]?.workflowId, "workflow-1");
  assert.equal(result.snapshot.models.monitoringSummary[0]?.monitorId, "monitor-1");
  assert.equal(result.snapshot.models.authenticationSummary[0]?.assuranceLevel, "aal2");
  assert.equal(Object.isFrozen(result.snapshot), true);
  assert.equal(Object.isFrozen(result.snapshot.models.authenticationSummary), true);
  assert.deepEqual(replayDashboardSnapshot(input), result);

  const missing = createDashboardSnapshot({ ...input, source: dashboardSource({ healthSnapshots: [], diagnosticsProjections: [] }) });
  assert.equal(missing.status === "success" && missing.snapshot.completeness, "MISSING");
  const unavailable = createDashboardSnapshot({ ...input, projectionVersion: "unknown" });
  assert.equal(unavailable.status, "unavailable");
  console.log("director dashboard deterministic aggregation and snapshot checks passed");
}

main();
