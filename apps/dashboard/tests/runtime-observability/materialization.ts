import assert from "node:assert/strict";
import {
  DIAGNOSTICS_READ_MODEL_ID,
  flushRuntimeObservabilityForTests,
  healthSnapshotCollection,
  INSTRUMENTED_COMPONENTS,
  materializationReport,
  materializeRuntimeEvidence,
  monitorIdFor,
  monitoringAggregateSnapshot,
  observeProjectionRefresh,
  PLATFORM_AUTHORITY,
  runtimeMonitorDefinitions,
} from "../../src/features/runtime-observability";
import { ensureRuntimeProjectionRegistry } from "../../src/features/runtime-projection";

const at = new Date("2026-07-21T12:30:00.000Z");

async function seedRealRuntimeActivity(): Promise<void> {
  ensureRuntimeProjectionRegistry();
  await flushRuntimeObservabilityForTests();
}

/** Monitoring aggregates come from the existing aggregation function. */
function monitoringMaterializes(): void {
  const aggregates = monitoringAggregateSnapshot();
  assert.equal(aggregates.length > 0, true);
  for (const aggregate of aggregates) {
    assert.equal(aggregate.platformAuthority, PLATFORM_AUTHORITY);
    assert.equal(aggregate.tenantId, undefined, "platform aggregates must carry no tenant id");
    assert.equal(aggregate.signalType, "operational-event");
    assert.equal(aggregate.count > 0, true);
    assert.equal(Object.isFrozen(aggregate), true);
  }
  const monitorIds = new Set(aggregates.map(({ monitorId }) => monitorId));
  for (const component of INSTRUMENTED_COMPONENTS) {
    assert.equal(monitorIds.has(monitorIdFor(component)), true, `${component} must produce an aggregate`);
  }
}

/** Health snapshots come from the existing monitor engine, already scored. */
function healthMaterializes(): void {
  const snapshots = healthSnapshotCollection();
  assert.equal(snapshots.length, INSTRUMENTED_COMPONENTS.length);
  const definitions = runtimeMonitorDefinitions();
  for (const snapshot of snapshots) {
    assert.equal(["healthy", "watch", "degraded", "critical", "unknown"].includes(snapshot.state), true);
    assert.equal(["FULL", "PARTIAL", "UNKNOWN", "MISSING"].includes(snapshot.evidenceCompleteness), true);
    assert.equal(snapshot.evidenceReferences.length > 0, true, "health must cite its evidence");
    assert.equal(Object.isFrozen(snapshot), true);
    const definition = definitions.find((candidate) => candidate.monitorId === snapshot.monitorId);
    assert.notEqual(definition, undefined);
    // Severity is the monitor's mapping, never recomputed by the coordinator.
    assert.equal(snapshot.severity, definition!.severityMapping[snapshot.state]);
  }
}

/** Diagnostics projections come from the existing projection function. */
function diagnosticsMaterializes(): void {
  const evidence = materializeRuntimeEvidence(at);
  assert.equal(evidence.diagnosticsProjections.length > 0, true);
  for (const projection of evidence.diagnosticsProjections) {
    assert.equal(["component", "service", "platform"].includes(projection.kind), true);
    assert.equal(projection.platformAuthority, PLATFORM_AUTHORITY);
    assert.equal(projection.tenantId, undefined);
    assert.equal(Object.isFrozen(projection), true);
  }
  assert.equal(evidence.diagnosticsSnapshot?.snapshotId.startsWith(DIAGNOSTICS_READ_MODEL_ID), true);
  assert.equal(evidence.diagnosticsSnapshot?.authoritative, false);
}

/** Replaying the same signals must produce identical read models. */
function replayIsDeterministic(): void {
  assert.deepEqual(materializeRuntimeEvidence(at), materializeRuntimeEvidence(at));
  assert.deepEqual(monitoringAggregateSnapshot(at), monitoringAggregateSnapshot(at));
  assert.deepEqual(healthSnapshotCollection(at), healthSnapshotCollection(at));
}

/** Read-side surfaces are deeply immutable. */
function readSideIsImmutable(): void {
  const evidence = materializeRuntimeEvidence(at);
  assert.equal(Object.isFrozen(evidence), true);
  assert.equal(Object.isFrozen(evidence.report), true);
  assert.equal(Object.isFrozen(evidence.monitoringAggregates), true);
  assert.equal(Object.isFrozen(evidence.healthSnapshots), true);
  assert.throws(() => {
    (evidence.monitoringAggregates as unknown as { push: (value: unknown) => void }).push({});
  });
}

/** A failed refresh degrades the component through the existing monitor rule. */
async function failedRefreshDegradesComponent(): Promise<void> {
  const component = INSTRUMENTED_COMPONENTS[1];
  observeProjectionRefresh({
    component,
    outcome: "failed",
    version: 4242,
    observedAt: new Date().toISOString(),
    reasonCode: "stale",
  });
  await flushRuntimeObservabilityForTests();

  const snapshot = healthSnapshotCollection().find(({ monitorId }) => monitorId === monitorIdFor(component));
  assert.notEqual(snapshot, undefined);
  assert.equal(snapshot!.state, "degraded", "an observed failure must degrade the component");
  assert.equal(snapshot!.severity, "warning");

  // Sibling components are unaffected.
  const sibling = healthSnapshotCollection().find(({ monitorId }) => monitorId === monitorIdFor(INSTRUMENTED_COMPONENTS[0]));
  assert.equal(sibling?.state, "healthy");
}

/** Report status distinguishes materialized, empty, and failed. */
function reportIsTruthful(): void {
  const report = materializationReport();
  assert.equal(report.signalCount > 0, true);
  for (const outcome of [report.monitoring, report.health, report.diagnostics]) {
    assert.equal(["materialized", "empty", "failed"].includes(outcome.status), true);
  }
  assert.equal(materializationReport(new Date("not-a-date")).monitoring.status, "failed");
}

async function main(): Promise<void> {
  await seedRealRuntimeActivity();
  monitoringMaterializes();
  healthMaterializes();
  diagnosticsMaterializes();
  replayIsDeterministic();
  readSideIsImmutable();
  await failedRefreshDegradesComponent();
  reportIsTruthful();
  console.log("runtime observability materialization checks passed");
}

void main();
