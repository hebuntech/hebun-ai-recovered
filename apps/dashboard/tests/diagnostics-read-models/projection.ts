import assert from "node:assert/strict";
import {
  createDiagnosticsSnapshot,
  createProjectionState,
  DiagnosticsReadModelRegistry,
  projectCanonicalSignals,
  rebuildProjection,
} from "../../src/features/diagnostics-read-models";
import type { CanonicalSignal } from "../../src/features/observability";
import { canonicalDiagnosticsSignal } from "../helpers/diagnostics-read-models";
import { canonicalMetric } from "../helpers/monitoring";

const authority = { kind: "tenant", tenantId: "tenant-a", resolvedBy: "server" } as const;
const registry = new DiagnosticsReadModelRegistry([{
  readModelId: "diagnostics", version: "1", lifecycle: "active", owner: "observability",
  compatibility: "backward-compatible", compatibleSignalSchemaVersions: [1],
  projectionKinds: ["component", "service", "tenant", "evaluation", "health"],
}]);

const signals = [
  canonicalMetric({ signalId: "metric-1", value: 10, canonicalEventTime: "2026-07-21T12:00:01.000Z" }),
  canonicalDiagnosticsSignal({ signalId: "evaluation-1", signalType: "evaluation-result", canonicalEventTime: "2026-07-21T12:00:02.000Z", payload: { evaluationRunId: "run-1", evaluatorId: "evaluator-1", evaluatorVersion: "1", subjectType: "workflow", subjectId: "workflow-1", outcome: "passed", score: 0.9, evidenceReferences: ["evidence-1"] } }),
  canonicalDiagnosticsSignal({ signalId: "health-1", signalType: "health-signal", canonicalEventTime: "2026-07-21T12:00:03.000Z", payload: { subjectType: "component", subjectId: "api", dimension: "availability", state: "degraded", evidenceReferences: ["metric-1"], derivationVersion: "1" } }),
];

function main(): void {
  const empty = createProjectionState("diagnostics", "1");
  const projected = projectCanonicalSignals({ state: empty, signals: [...signals].reverse(), registry, authorityScope: authority });
  assert.equal(projected.status, "success");
  if (projected.status !== "success") return;
  assert.equal(projected.added, 11);
  assert.equal(empty.projections.length, 0);
  assert.equal(Object.isFrozen(projected.state.projections), true);
  assert.equal(projected.state.projections.some(({ kind }) => kind === "evaluation"), true);
  assert.equal(projected.state.projections.some(({ kind }) => kind === "health"), true);
  assert.equal("payload" in projected.state.projections[0]!, false);
  assert.equal("metadata" in projected.state.projections[0]!, false);

  const replay = projectCanonicalSignals({ state: projected.state, signals, registry, authorityScope: authority });
  assert.equal(replay.status === "success" && replay.added, 0);
  assert.equal(replay.status === "success" && replay.state.projections.length, projected.state.projections.length);

  const firstBatch = projectCanonicalSignals({ state: empty, signals: signals.slice(0, 2), registry, authorityScope: authority });
  assert.equal(firstBatch.status, "success");
  const incremental = firstBatch.status === "success"
    ? projectCanonicalSignals({ state: firstBatch.state, signals: signals.slice(2), registry, authorityScope: authority })
    : firstBatch;
  assert.equal(incremental.status, "success");
  assert.deepEqual(incremental.status === "success" && incremental.state, projected.state);

  const rebuilt = rebuildProjection({ readModelId: "diagnostics", projectionVersion: "1", signals, registry, authorityScope: authority });
  assert.equal(rebuilt.status, "success");
  assert.deepEqual(rebuilt.status === "success" && rebuilt.state, projected.state);

  const snapshot = createDiagnosticsSnapshot(projected.state, new Date("2026-07-21T12:01:00.000Z"));
  assert.equal(snapshot?.projectionCount, 11);
  assert.equal(snapshot?.authoritative, false);
  assert.equal(Object.isFrozen(snapshot), true);

  const foreign = canonicalMetric({ signalId: "foreign", value: 1, canonicalEventTime: "2026-07-21T12:00:01.000Z", tenantId: "tenant-b" });
  assert.equal(projectCanonicalSignals({ state: empty, signals: [foreign], registry, authorityScope: authority }).status, "insufficient_scope");
  assert.equal(projectCanonicalSignals({ state: empty, signals: [Object.freeze({ signalId: "fake" }) as CanonicalSignal], registry, authorityScope: authority }).status, "invalid_source");

  console.log("deterministic, idempotent diagnostics projection and rebuild checks passed");
}

main();
