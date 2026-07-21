import assert from "node:assert/strict";
import {
  appendDiagnosticsTimeline,
  createDiagnosticsTimeline,
  createProjectionState,
  DiagnosticsReadModelRegistry,
  projectCanonicalSignals,
  queryDiagnostics,
  type DiagnosticsQueryFilter,
} from "../../src/features/diagnostics-read-models";
import { canonicalDiagnosticsSignal } from "../helpers/diagnostics-read-models";
import { canonicalMetric } from "../helpers/monitoring";

function main(): void {
  const authority = { kind: "tenant", tenantId: "tenant-a", resolvedBy: "server" } as const;
  const registry = new DiagnosticsReadModelRegistry([{ readModelId: "diagnostics", version: "1", lifecycle: "active", owner: "observability", compatibility: "backward-compatible", compatibleSignalSchemaVersions: [1], projectionKinds: ["component", "evaluation", "health"] }]);
  const signals = [
    canonicalMetric({ signalId: "metric", value: 1, canonicalEventTime: "2026-07-21T12:00:01.000Z" }),
    canonicalDiagnosticsSignal({ signalId: "evaluation", signalType: "evaluation-result", canonicalEventTime: "2026-07-21T12:00:02.000Z", payload: { evaluationRunId: "run", evaluatorId: "evaluator", evaluatorVersion: "1", subjectType: "workflow", subjectId: "workflow", outcome: "failed", evidenceReferences: ["evidence"] } }),
    canonicalDiagnosticsSignal({ signalId: "health", signalType: "health-signal", canonicalEventTime: "2026-07-21T12:00:03.000Z", payload: { subjectType: "component", subjectId: "api", dimension: "availability", state: "critical", evidenceReferences: ["metric"], derivationVersion: "1" } }),
  ];
  const result = projectCanonicalSignals({ state: createProjectionState("diagnostics", "1"), signals, registry, authorityScope: authority });
  assert.equal(result.status, "success");
  if (result.status !== "success") return;

  assert.equal(queryDiagnostics({ state: result.state, authorityScope: authority, filter: { tenantId: "tenant-a", component: "monitoring", healthState: "critical", monitorId: "monitor-1" } }).status, "success");
  assert.equal(queryDiagnostics({ state: result.state, authorityScope: authority, filter: { evaluatorId: "evaluator", signalType: "evaluation-result" } }).status, "success");
  assert.equal(queryDiagnostics({ state: result.state, authorityScope: authority, filter: { component: "missing" } }).status, "empty");
  assert.equal(queryDiagnostics({ state: result.state, authorityScope: authority, filter: { tenantId: "tenant-b" } }).status, "insufficient_scope");
  assert.equal(queryDiagnostics({ state: result.state, authorityScope: authority, filter: { unknown: "value" } as DiagnosticsQueryFilter }).status, "invalid_filter");
  assert.equal(queryDiagnostics({ authorityScope: authority, filter: {} }).status, "projection_unavailable");

  const timeline = createDiagnosticsTimeline(result.state);
  assert.deepEqual(timeline.entries.map(({ sourceSignalId }) => sourceSignalId), ["metric", "evaluation", "health"]);
  assert.equal(Object.isFrozen(timeline.entries), true);
  const appended = appendDiagnosticsTimeline(timeline, result.state);
  assert.equal(appended.entries.length, timeline.entries.length);
  assert.equal(Object.keys(timeline.correlationGroups).length, 3);

  const platformSignal = canonicalDiagnosticsSignal({
    signalId: "platform-health", signalType: "health-signal", canonicalEventTime: "2026-07-21T12:00:04.000Z", platformAuthority: "platform-control",
    payload: { subjectType: "platform", subjectId: "control", dimension: "availability", state: "healthy", evidenceReferences: ["platform-evidence"], derivationVersion: "1" },
  });
  const platformRegistry = new DiagnosticsReadModelRegistry([{ readModelId: "platform", version: "1", lifecycle: "active", owner: "observability", compatibility: "backward-compatible", compatibleSignalSchemaVersions: [1], projectionKinds: ["platform", "health"] }]);
  const platformAuthority = { kind: "platform", authority: "platform-control", resolvedBy: "server" } as const;
  const platformResult = projectCanonicalSignals({ state: createProjectionState("platform", "1"), signals: [platformSignal], registry: platformRegistry, authorityScope: platformAuthority });
  assert.equal(platformResult.status, "success");
  assert.equal(platformResult.status === "success" && queryDiagnostics({ state: platformResult.state, authorityScope: platformAuthority, filter: { platformAuthority: "platform-control", healthState: "healthy" } }).status, "success");
  assert.equal(platformResult.status === "success" && queryDiagnostics({ state: platformResult.state, authorityScope: platformAuthority, filter: { tenantId: "tenant-a" } }).status, "insufficient_scope");

  console.log("scope-bound diagnostics query and append-only timeline checks passed");
}

main();
