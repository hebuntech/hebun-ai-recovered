import assert from "node:assert/strict";
import { createDashboardSnapshot, queryDashboard } from "../../src/features/director-dashboard-data";
import { dashboardRegistry, dashboardSource, tenantScope } from "../helpers/director-dashboard-data";

function main(): void {
  const aggregated = createDashboardSnapshot({ registry: dashboardRegistry(), source: dashboardSource(), authorityScope: tenantScope, projectionVersion: "1.0.0", generatedAt: new Date("2026-07-21T12:30:00.000Z") });
  assert.equal(aggregated.status, "success");
  if (aggregated.status !== "success") return;
  assert.equal(queryDashboard({ snapshot: aggregated.snapshot, authorityScope: tenantScope, filter: { component: "runtime-engine", healthState: "healthy", evaluationStatus: "passed" } }).status, "success");
  assert.equal(queryDashboard({ snapshot: aggregated.snapshot, authorityScope: tenantScope, filter: { agentId: "unknown", workflowId: "unknown", component: "unknown" } }).status, "empty");
  assert.equal(queryDashboard({ snapshot: aggregated.snapshot, authorityScope: tenantScope, filter: { tenantId: "tenant-b" } }).status, "invalid_scope");
  assert.equal(queryDashboard({ snapshot: aggregated.snapshot, authorityScope: { kind: "platform", authority: "platform", resolvedBy: "server" }, filter: {} }).status, "invalid_scope");
  assert.equal(queryDashboard({ snapshot: aggregated.snapshot, authorityScope: tenantScope, filter: { healthState: "invalid" } as never }).status, "invalid_filter");
  assert.equal(queryDashboard({ snapshot: aggregated.snapshot, authorityScope: tenantScope, filter: { from: "invalid" } }).status, "invalid_filter");
  assert.equal(queryDashboard({ authorityScope: tenantScope, filter: {} }).status, "unavailable");

  const crossTenant = createDashboardSnapshot({
    registry: dashboardRegistry(), authorityScope: tenantScope, projectionVersion: "1.0.0", generatedAt: new Date("2026-07-21T12:30:00.000Z"),
    source: dashboardSource({ authenticationSessions: [{ ...dashboardSource().authenticationSessions[0]!, activeTenantId: "tenant-b" }] }),
  });
  assert.equal(crossTenant.status, "invalid_scope");
  const serialized = JSON.stringify(aggregated.snapshot);
  for (const forbidden of ["accessToken", "refreshToken", "providerPayload", "hiddenReasoning", "permissionSummary", "memoryContent"]) {
    assert.equal(serialized.includes(forbidden), false);
  }
  console.log("director dashboard query, isolation, and security checks passed");
}

main();
