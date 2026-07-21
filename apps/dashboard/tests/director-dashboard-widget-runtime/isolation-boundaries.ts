import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createDashboardSnapshot } from "../../src/features/director-dashboard-data";
import { createDefaultWidgetRegistry, WidgetRefreshEngine } from "../../src/features/director-dashboard-widget-runtime";
import { dashboardRegistry, dashboardSource, tenantScope } from "../helpers/director-dashboard-data";

function main(): void {
  const result = createDashboardSnapshot({ registry: dashboardRegistry(), source: dashboardSource(), authorityScope: tenantScope, projectionVersion: "1.0.0", generatedAt: new Date("2026-07-21T12:30:00.000Z") });
  assert.equal(result.status, "success");
  if (result.status !== "success") return;
  const engine = new WidgetRefreshEngine(createDefaultWidgetRegistry(), "1.0.0");
  const crossTenant = engine.manualRefresh({ snapshot: result.snapshot, authorityScope: { kind: "tenant", tenantId: "tenant-b", resolvedBy: "server" } });
  assert.equal(Object.values(crossTenant.states).every(({ state, reason }) => state === "unavailable" && reason === "INVALID_SCOPE"), true);

  const malformed = {
    ...result.snapshot,
    models: { ...result.snapshot.models, runtimeOverview: undefined },
  } as unknown as typeof result.snapshot;
  const isolated = engine.manualRefresh({ snapshot: malformed, authorityScope: tenantScope });
  assert.equal(isolated.states["runtime-overview"].state, "failed");
  assert.equal(isolated.states["active-agents"].state, "ready");
  assert.equal(isolated.states["active-workflows"].state, "ready");

  const directory = join(process.cwd(), "src/features/director-dashboard-widget-runtime");
  const source = readdirSync(directory).filter((name) => name.endsWith(".ts")).map((name) => readFileSync(join(directory, name), "utf8")).join("\n");
  for (const forbiddenImport of [
    "../runtime-", "../monitoring", "../diagnostics-read-models", "../evaluation", "../auth", "../observability",
  ]) assert.equal(source.includes(`from \"${forbiddenImport}`), false);
  for (const forbiddenField of ["accessToken", "refreshToken", "providerPayload", "hiddenReasoning", "memoryContent"]) {
    assert.equal(JSON.stringify(isolated).includes(forbiddenField), false);
  }
  console.log("director dashboard widget isolation and authority boundary checks passed");
}

main();
