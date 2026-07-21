import assert from "node:assert/strict";
import { DashboardRegistry } from "../../src/features/director-dashboard-data";
import { dashboardRegistry } from "../helpers/director-dashboard-data";

function main(): void {
  const registry = dashboardRegistry();
  assert.equal(registry.list().length, 8);
  assert.equal(registry.resolve("runtime-overview", "1.0.0").status, "resolved");
  assert.equal(registry.resolve("unknown", "1.0.0").status, "unknown_section");
  const first = registry.list()[0]!;
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.supportedWidgets), true);
  assert.equal(registry.register(first).status, "duplicate");
  assert.equal(registry.register({ ...first, version: "2.0.0" }).status, "registered");
  assert.throws(() => new DashboardRegistry([{ ...first, supportedWidgets: [] }]));
  console.log("director dashboard registry checks passed");
}

main();
