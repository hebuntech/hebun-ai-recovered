import assert from "node:assert/strict";
import {
  canonicalSignalSchemaRegistry,
  createCollectionPipeline,
  type CollectionPipelineDependencies,
  type ProducerObservation,
} from "../../src/features/observability";
import { metricObservation, policyEngine, sink, tenantContext } from "../helpers/observability-collection";

const now = () => new Date("2026-07-21T12:00:01.000Z");

function pipeline(overrides: Partial<CollectionPipelineDependencies> = {}) {
  const telemetry = sink();
  return {
    telemetry,
    emitter: createCollectionPipeline({
      registry: canonicalSignalSchemaRegistry,
      policyEngine: policyEngine(),
      sinks: new Map([["telemetry", telemetry]]),
      maxCandidatePayloadBytes: 8_192,
      maxClockDriftMs: 5_000,
      now,
      ...overrides,
    }),
  };
}

async function main(): Promise<void> {
  const valid = pipeline();
  const producerInput = metricObservation();
  assert.deepEqual(await valid.emitter.submit({ ...producerInput, producerSelectedRoute: "audit" } as ProducerObservation, tenantContext), {
    status: "accepted", signalId: "signal-1", routes: ["telemetry"],
  });
  assert.equal(Object.isFrozen(producerInput.payload), false);
  const stored = valid.telemetry.query({ tenantId: "tenant-a" }, tenantContext.tenantScope);
  assert.equal(stored.length, 1);
  assert.equal(stored[0]?.signalType, "metric");
  assert.deepEqual(stored[0]?.correlation.relationships.map(({ type, id }) => ({ type, id })), tenantContext.relationships.map(({ type, id }) => ({ type, id })));

  assert.equal((await pipeline().emitter.submit(metricObservation({ signalType: "unknown" }), tenantContext)).status, "rejected_version");
  assert.equal((await pipeline().emitter.submit(metricObservation({ schemaVersion: 99 }), tenantContext)).status, "rejected_version");
  assert.equal((await pipeline().emitter.submit(metricObservation({ metadata: { accessToken: "secret" } as never }), tenantContext)).status, "rejected_security");
  assert.equal((await pipeline().emitter.submit(metricObservation({ payload: { name: "metric", value: 1, unit: "count", kind: "counter", nested: { refreshToken: "secret" } } }), tenantContext)).status, "rejected_security");
  assert.equal((await pipeline().emitter.submit(metricObservation({ payload: { name: "metric", value: 1, unit: "count", kind: "counter", hiddenReasoning: "private" } }), tenantContext)).status, "rejected_security");
  assert.equal((await pipeline().emitter.submit(metricObservation({ payload: { name: "metric", value: 1, unit: "count", kind: "counter", providerRawResponse: {} } }), tenantContext)).status, "rejected_security");
  assert.equal((await pipeline().emitter.submit(metricObservation({ payload: { name: "metric", value: 1, unit: "count", kind: "counter", otp: "123456" } }), tenantContext)).status, "rejected_security");
  assert.equal((await pipeline().emitter.submit(metricObservation({ tenantIdCandidate: "tenant-b" }), tenantContext)).status, "rejected_scope");
  assert.equal((await pipeline().emitter.submit(metricObservation({ platformAuthorityCandidate: "platform" }), tenantContext)).status, "rejected_scope");
  assert.equal((await pipeline().emitter.submit(metricObservation({ correlationCandidates: [{ type: "request", id: "client-id", tenantId: "tenant-a" }] }), tenantContext)).status, "rejected_correlation");
  assert.equal((await pipeline().emitter.submit(metricObservation({ correlationCandidates: [{ type: "request", id: "request-server-1", tenantId: "tenant-b" }] }), tenantContext)).status, "rejected_correlation");

  const oversized = pipeline({ maxCandidatePayloadBytes: 32 });
  assert.equal((await oversized.emitter.submit(metricObservation(), tenantContext)).status, "rejected_invalid");
  assert.equal(oversized.telemetry.query({ tenantId: "tenant-a" }, tenantContext.tenantScope).length, 0);

  const discarded = pipeline({ policyEngine: policyEngine("discard") });
  assert.equal((await discarded.emitter.submit(metricObservation(), tenantContext)).status, "discarded_by_policy");
  assert.equal(discarded.telemetry.query({ tenantId: "tenant-a" }, tenantContext.tenantScope).length, 0);

  const wrongRoutePolicy = policyEngine();
  const unapproved = pipeline({
    policyEngine: {
      evaluate(candidate, schema) {
        return { ...wrongRoutePolicy.evaluate(candidate, schema), approvedRoutes: ["audit"] };
      },
    },
  });
  assert.equal((await unapproved.emitter.submit(metricObservation(), tenantContext)).status, "rejected_invalid");
  assert.equal(unapproved.telemetry.query({ tenantId: "tenant-a" }, tenantContext.tenantScope).length, 0);

  console.log("observability collection pipeline checks passed");
}

void main();
