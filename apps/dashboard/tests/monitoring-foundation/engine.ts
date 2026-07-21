import assert from "node:assert/strict";
import {
  createMonitorDefinition,
  evaluateMonitor,
  MonitoringRegistry,
} from "../../src/features/monitoring";
import { canonicalMetric, canonicalOperationalEvent, monitorDefinition } from "../helpers/monitoring";

const now = new Date("2026-07-21T12:00:00.000Z");
const authority = { kind: "tenant", tenantId: "tenant-a", resolvedBy: "server" } as const;

function evaluate(overrides = {}, signals = [canonicalMetric({ signalId: "signal-1", value: 100, canonicalEventTime: "2026-07-21T11:59:30.000Z" })]) {
  const created = createMonitorDefinition(monitorDefinition(overrides));
  assert.equal(created.status, "created");
  if (created.status !== "created") throw new Error("test definition invalid");
  const registry = new MonitoringRegistry([{
    monitorId: created.value.monitorId, version: created.value.version, lifecycle: created.value.lifecycle,
    owner: created.value.owner, compatibility: created.value.compatibility, compatibleSignalSchemaVersions: [1],
  }]);
  return evaluateMonitor({ registry, definition: created.value, signals, authorityScope: authority, now });
}

function main(): void {
  assert.equal(evaluate().status, "healthy");
  const critical = evaluate({}, [canonicalMetric({ signalId: "signal-1", value: 700, canonicalEventTime: "2026-07-21T11:59:30.000Z" })]);
  assert.equal(critical.status, "critical");
  assert.equal(critical.status === "critical" && critical.alertCandidate?.healthState, "critical");

  const missing = evaluate({}, [canonicalMetric({ signalId: "missing", value: 100, canonicalEventTime: "2026-07-21T11:59:30.000Z", evidenceCompleteness: "MISSING" })]);
  assert.equal(missing.status, "insufficient_evidence");
  const unknown = evaluate({}, [canonicalMetric({ signalId: "unknown", value: 100, canonicalEventTime: "2026-07-21T11:59:30.000Z", evidenceCompleteness: "UNKNOWN" })]);
  assert.equal(unknown.status, "unknown");
  assert.equal(evaluate({ allowUnknownEvidence: true }, [canonicalMetric({ signalId: "unknown", value: 100, canonicalEventTime: "2026-07-21T11:59:30.000Z", evidenceCompleteness: "UNKNOWN" })]).status, "watch");

  assert.equal(evaluate({ rules: [{ ruleId: "minimum", kind: "window", minimumSignals: 2, state: "watch" }] }).status, "watch");
  assert.equal(evaluate({ signalSources: ["operational-event"], rules: [{ ruleId: "failure-ratio", kind: "ratio", maximumFailureRatio: 0.4, state: "degraded" }] }, [
    canonicalOperationalEvent({ signalId: "failed", outcome: "failed", canonicalEventTime: "2026-07-21T11:59:20.000Z" }),
    canonicalOperationalEvent({ signalId: "passed", outcome: "succeeded", canonicalEventTime: "2026-07-21T11:59:40.000Z" }),
  ]).status, "degraded");
  assert.equal(evaluate({ rules: [
    { ruleId: "high", kind: "threshold", operator: "gte", value: 500, state: "degraded" },
    { ruleId: "composite", kind: "composite", ruleReferences: ["high"], strategy: "all", state: "critical" },
  ] }, [canonicalMetric({ signalId: "high", value: 700, canonicalEventTime: "2026-07-21T11:59:30.000Z" })]).status, "critical");
  assert.equal(evaluate({ rules: [{ ruleId: "trend", kind: "trend", maximumNegativeDelta: 10, state: "degraded" }], aggregation: "latest" }, [
    canonicalMetric({ signalId: "first", value: 100, canonicalEventTime: "2026-07-21T11:59:10.000Z" }),
    canonicalMetric({ signalId: "last", value: 50, canonicalEventTime: "2026-07-21T11:59:50.000Z" }),
  ]).status, "degraded");
  assert.equal(evaluate({}, [canonicalMetric({ signalId: "foreign", value: 100, canonicalEventTime: "2026-07-21T11:59:30.000Z", tenantId: "tenant-b" })]).status, "evaluation_failed");

  const unknownRegistry = new MonitoringRegistry([]);
  const definition = monitorDefinition();
  assert.equal(evaluateMonitor({ registry: unknownRegistry, definition, signals: [], authorityScope: authority, now }).status, "evaluation_failed");

  console.log("deterministic health rule and fail-closed checks passed");
}

main();
