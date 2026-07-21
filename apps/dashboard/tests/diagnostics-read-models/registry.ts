import assert from "node:assert/strict";
import { DiagnosticsReadModelRegistry } from "../../src/features/diagnostics-read-models";

function main(): void {
  const registry = new DiagnosticsReadModelRegistry([{
    readModelId: "operational-diagnostics", version: "1", lifecycle: "active", owner: "observability",
    compatibility: "backward-compatible", compatibleSignalSchemaVersions: [1],
    projectionKinds: ["component", "service", "tenant", "platform", "evaluation", "health"],
  }]);
  assert.equal(registry.resolve("operational-diagnostics", "1", 1).status, "resolved");
  assert.equal(registry.resolve("unknown", "1", 1).status, "unknown_read_model");
  assert.equal(registry.resolve("operational-diagnostics", "1", 2).status, "incompatible");
  assert.equal(Object.isFrozen(registry), true);
  assert.equal(Object.isFrozen(registry.list()), true);
  assert.equal(Object.isFrozen(registry.list()[0]), true);
  assert.equal(registry.register(registry.list()[0]!).status, "duplicate");
  const registered = registry.register({ ...registry.list()[0]!, version: "2" });
  assert.equal(registered.status, "registered");
  assert.equal(registered.status === "registered" && registered.registry.list().length, 2);

  console.log("diagnostics read model registry checks passed");
}

main();
