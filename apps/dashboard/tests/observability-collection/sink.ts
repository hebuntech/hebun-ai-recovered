import assert from "node:assert/strict";
import {
  canonicalSignalSchemaRegistry,
  createCollectionPipeline,
  type CanonicalSignal,
  type ProducerObservation,
} from "../../src/features/observability";
import { metricObservation, policyEngine, sink, tenantContext } from "../helpers/observability-collection";

const now = () => new Date("2026-07-21T12:00:01.000Z");

async function main(): Promise<void> {
  const telemetry = sink("telemetry", 1);
  const emitter = createCollectionPipeline({
    registry: canonicalSignalSchemaRegistry,
    policyEngine: policyEngine(),
    sinks: new Map([["telemetry", telemetry]]),
    maxCandidatePayloadBytes: 8_192,
    maxClockDriftMs: 5_000,
    now,
  });
  assert.equal((await emitter.submit(metricObservation(), tenantContext)).status, "accepted");
  assert.equal((await emitter.submit(metricObservation({ signalId: "signal-2" }), tenantContext)).status, "rejected_capacity");
  assert.equal(telemetry.query({ tenantId: "tenant-a" }, tenantContext.tenantScope).length, 1);
  assert.throws(() => telemetry.query({ tenantId: "tenant-b", platformAuthority: "platform" }, tenantContext.tenantScope));
  assert.throws(() => telemetry.query({ tenantId: "tenant-b" }, tenantContext.tenantScope));
  assert.throws(() => telemetry.query({}, tenantContext.tenantScope));

  const stored = telemetry.query({ tenantId: "tenant-a" }, tenantContext.tenantScope);
  assert.equal(Object.isFrozen(stored), true);
  assert.equal(Object.isFrozen(stored[0]), true);
  assert.throws(() => ((stored[0] as { signalId: string }).signalId = "mutated"));
  assert.equal(telemetry.query({ tenantId: "tenant-a" }, tenantContext.tenantScope)[0]?.signalId, "signal-1");

  const duplicateSink = sink();
  const duplicateEmitter = createCollectionPipeline({
    registry: canonicalSignalSchemaRegistry,
    policyEngine: policyEngine(),
    sinks: new Map([["telemetry", duplicateSink]]),
    maxCandidatePayloadBytes: 8_192,
    maxClockDriftMs: 5_000,
    now,
  });
  assert.equal((await duplicateEmitter.submit(metricObservation(), tenantContext)).status, "accepted");
  assert.equal((await duplicateEmitter.submit(metricObservation(), tenantContext)).status, "rejected_invalid");
  assert.equal(duplicateSink.query({ tenantId: "tenant-a" }, tenantContext.tenantScope).length, 1);
  await assert.rejects(() => duplicateSink.append(Object.freeze({
    route: "telemetry",
    disposition: "telemetry",
    signal: Object.freeze({ signalId: "spoofed" }) as CanonicalSignal,
  })));

  if (false) {
    const observation: ProducerObservation = metricObservation();
    // @ts-expect-error Producer observations cannot be used as canonical signals.
    const canonical: CanonicalSignal = observation;
    // @ts-expect-error A sink cannot accept a raw producer observation.
    await telemetry.append(observation);
    // @ts-expect-error Arbitrary metadata is not part of the producer contract.
    const unsafe: ProducerObservation = { ...observation, metadata: { arbitrary: "value" } };
    void canonical;
    void unsafe;
  }

  console.log("observability in-memory sink checks passed");
}

void main();
