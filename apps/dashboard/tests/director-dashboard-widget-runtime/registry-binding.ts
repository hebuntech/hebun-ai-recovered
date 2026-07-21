import assert from "node:assert/strict";
import { createDashboardSnapshot } from "../../src/features/director-dashboard-data";
import {
  bindWidget,
  createDefaultWidgetRegistry,
  DASHBOARD_WIDGET_IDS,
  WidgetRegistry,
} from "../../src/features/director-dashboard-widget-runtime";
import { dashboardRegistry, dashboardSource, tenantScope } from "../helpers/director-dashboard-data";

function main(): void {
  const registry = createDefaultWidgetRegistry();
  assert.equal(registry.list().length, 8);
  assert.equal(registry.resolve("active-agents", "1.0.0").status, "resolved");
  assert.equal(registry.resolve("unknown", "1.0.0").status, "unknown_widget");
  assert.equal(Object.isFrozen(registry.list()[0]), true);
  assert.throws(() => new WidgetRegistry([{ ...registry.list()[0]!, readModel: "healthSummary" }]));

  const aggregated = createDashboardSnapshot({ registry: dashboardRegistry(), source: dashboardSource(), authorityScope: tenantScope, projectionVersion: "1.0.0", generatedAt: new Date("2026-07-21T12:30:00.000Z") });
  assert.equal(aggregated.status, "success");
  if (aggregated.status !== "success") return;
  for (const widgetId of DASHBOARD_WIDGET_IDS) {
    const result = bindWidget({ registry, widgetId, version: "1.0.0", snapshot: aggregated.snapshot, authorityScope: tenantScope });
    assert.equal(result.state, "ready");
    if (result.state === "ready") {
      assert.equal(result.viewModel.widgetId, widgetId);
      assert.equal(result.viewModel.authoritative, false);
      assert.equal(Object.isFrozen(result.viewModel), true);
      assert.equal(Object.isFrozen(result.viewModel.items), true);
    }
  }
  assert.equal(bindWidget({ registry, widgetId: "unknown", version: "1.0.0", snapshot: aggregated.snapshot, authorityScope: tenantScope }).state, "unavailable");
  console.log("director dashboard widget registry and binding checks passed");
}

main();
