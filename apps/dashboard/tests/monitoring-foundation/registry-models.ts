import assert from "node:assert/strict";
import {
  appendHealthSnapshot,
  createHealthHistory,
  createMonitorDefinition,
  MonitoringRegistry,
} from "../../src/features/monitoring";
import { monitorDefinition } from "../helpers/monitoring";

function main(): void {
  const definition = monitorDefinition();
  const registryEntry = {
    monitorId: definition.monitorId, version: definition.version, lifecycle: definition.lifecycle,
    owner: definition.owner, compatibility: definition.compatibility, compatibleSignalSchemaVersions: [1],
  } as const;
  const registry = new MonitoringRegistry([registryEntry]);
  assert.equal(registry.resolve("latency-monitor", "1", 1).status, "resolved");
  assert.equal(registry.resolve("unknown", "1", 1).status, "unknown_monitor");
  assert.equal(registry.resolve("latency-monitor", "1", 2).status, "incompatible");
  assert.equal(registry.register(registryEntry).status, "duplicate");
  const registered = registry.register({ ...registryEntry, version: "2" });
  assert.equal(registered.status, "registered");
  assert.equal(registry.list().length, 1);
  assert.equal(Object.isFrozen(registry.list()[0]), true);

  const created = createMonitorDefinition(definition);
  assert.equal(created.status, "created");
  assert.equal(created.status === "created" && Object.isFrozen(created.value.rules), true);
  assert.equal(createMonitorDefinition({ ...definition, rules: [{ ruleId: "ratio", kind: "ratio", maximumFailureRatio: 2, state: "critical" }] }).status, "invalid");

  const snapshot = {
    snapshotId: "snapshot-1", monitorId: "latency-monitor", monitorVersion: "1",
    subject: definition.subject, state: "healthy", severity: "info", evidenceCompleteness: "FULL",
    evidenceReferences: ["signal-1"], window: { kind: "rolling", start: "2026-07-21T11:59:00.000Z", end: "2026-07-21T12:00:00.000Z" },
    evaluatedAt: "2026-07-21T12:00:00.000Z",
  } as const;
  const empty = createHealthHistory();
  const first = appendHealthSnapshot(empty, snapshot);
  const second = appendHealthSnapshot(first, { ...snapshot, snapshotId: "snapshot-2", state: "watch" });
  assert.equal(empty.snapshots.length, 0);
  assert.equal(first.snapshots.length, 1);
  assert.equal(second.snapshots.length, 2);
  assert.equal(first.snapshots[0]?.state, "healthy");
  assert.equal(Object.isFrozen(second.snapshots), true);

  console.log("monitor registry, definition, and append-only history checks passed");
}

main();
