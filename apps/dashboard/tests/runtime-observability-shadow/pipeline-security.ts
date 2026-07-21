import assert from "node:assert/strict";
import {
  canonicalSignalSchemaRegistry,
  createCollectionPipeline,
  type ProducerObservation,
} from "../../src/features/observability";
import {
  createShadowInstrumentationHooks,
  createShadowModeDispatcher,
  createShadowObservabilityConfig,
  type ShadowFailureRecord,
  type ShadowRuntimeEvent,
} from "../../src/features/runtime-observability-shadow";
import { policyEngine, sink, tenantContext } from "../helpers/observability-collection";

async function main(): Promise<void> {
  const telemetry = sink();
  const collection = createCollectionPipeline({
    registry: canonicalSignalSchemaRegistry,
    policyEngine: policyEngine(),
    sinks: new Map([["telemetry", telemetry]]),
    maxCandidatePayloadBytes: 8_192,
    maxClockDriftMs: 5_000,
    now: () => new Date("2026-07-21T12:00:01.000Z"),
  });
  const failures: ShadowFailureRecord[] = [];
  const config = createShadowObservabilityConfig({ enabled: true, instrumentationVersion: "1.0.0", environment: "dry-run" });
  const dispatcher = createShadowModeDispatcher({ config, emitter: collection, failureLogger: { record: (failure) => failures.push(failure) } });
  const hooks = createShadowInstrumentationHooks({ config, dispatcher });

  assert.equal(hooks.workflowCompleted({
    eventId: "workflow-1", timestamp: "2026-07-21T12:00:00.000Z", component: "workflow-runtime",
  }, { correlation: tenantContext }).status, "queued");
  await dispatcher.flushForTests();
  const stored = telemetry.query({ tenantId: "tenant-a" }, tenantContext.tenantScope);
  assert.equal(stored.length, 1);
  assert.equal(stored[0]?.signalId, "shadow-workflow-1");
  assert.equal(stored[0]?.tenantScope.kind, "tenant");
  assert.deepEqual(
    stored[0]?.correlation.relationships.map(({ type, id, tenantId }) => ({ type, id, tenantId })),
    tenantContext.relationships.map(({ type, id, tenantId }) => ({ type, id, tenantId })),
  );

  const crossTenant: ProducerObservation = {
    signalId: "shadow-cross-tenant", signalType: "operational-event", schemaVersion: 1,
    producer: { id: "hebun-runtime-shadow", producerClass: "runtime", version: "1.0.0" },
    source: { component: "runtime-engine", operation: "runtime.startup" },
    timestamp: "2026-07-21T12:00:00.000Z", tenantIdCandidate: "tenant-b",
    correlationCandidates: tenantContext.relationships, severityCandidate: "info",
    payload: { name: "runtime.startup", component: "runtime-engine", outcome: "unknown" },
    metadata: { environment: "dry-run" }, evidenceCompleteness: "FULL",
  };
  assert.equal(dispatcher.dispatch(crossTenant, tenantContext).status, "queued");
  await dispatcher.flushForTests();
  assert.equal(telemetry.query({ tenantId: "tenant-a" }, tenantContext.tenantScope).length, 1);
  assert.equal(failures.at(-1)?.collectionStatus, "rejected_scope");

  const safeEvent: ShadowRuntimeEvent = {
    eventId: "memory-1", timestamp: "2026-07-21T12:00:00.000Z", component: "memory-runtime",
  };
  // @ts-expect-error Runtime events deliberately have no credential transport field.
  safeEvent.accessToken = "credential";
  // @ts-expect-error Runtime events deliberately have no memory-content transport field.
  safeEvent.memoryContent = "private memory";

  console.log("runtime observability shadow pipeline security checks passed");
}

void main();
