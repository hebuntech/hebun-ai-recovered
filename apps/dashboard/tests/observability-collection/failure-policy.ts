import assert from "node:assert/strict";
import {
  canonicalSignalSchemaRegistry,
  createCollectionPipeline,
  type CanonicalSignalSink,
} from "../../src/features/observability";
import { metricObservation, policyEngine, tenantContext } from "../helpers/observability-collection";

const unavailable = (route: "telemetry" | "audit"): CanonicalSignalSink => ({
  route,
  async append() { throw new Error("unavailable"); },
});

function emitter(route: "telemetry" | "audit", includeSink: boolean) {
  return createCollectionPipeline({
    registry: canonicalSignalSchemaRegistry,
    policyEngine: policyEngine(route),
    sinks: includeSink ? new Map([[route, unavailable(route)]]) : new Map(),
    maxCandidatePayloadBytes: 8_192,
    maxClockDriftMs: 5_000,
    now: () => new Date("2026-07-21T12:00:01.000Z"),
  });
}

async function main(): Promise<void> {
  assert.deepEqual(await emitter("telemetry", false).submit(metricObservation(), tenantContext), {
    status: "sink_unavailable", signalId: "signal-1", runtimeAuthorityChanged: false,
  });
  assert.deepEqual(await emitter("telemetry", true).submit(metricObservation(), tenantContext), {
    status: "sink_unavailable", signalId: "signal-1", runtimeAuthorityChanged: false,
  });
  assert.deepEqual(await emitter("audit", false).submit(metricObservation(), tenantContext), {
    status: "audit_guarantee_failed", signalId: "signal-1", failClosed: true,
  });
  assert.deepEqual(await emitter("audit", true).submit(metricObservation(), tenantContext), {
    status: "audit_guarantee_failed", signalId: "signal-1", failClosed: true,
  });

  console.log("observability collection failure policy checks passed");
}

void main();
