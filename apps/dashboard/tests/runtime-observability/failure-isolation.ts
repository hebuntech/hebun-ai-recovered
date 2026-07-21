import assert from "node:assert/strict";
import {
  canonicalSignalSchemaRegistry,
  createCollectionPipeline,
  InMemoryAppendOnlySignalSink,
  type CanonicalSignalSink,
  type ProducerObservation,
} from "../../src/features/observability";
import {
  createShadowInstrumentationHooks,
  createShadowModeDispatcher,
  createShadowObservabilityConfig,
  runWithShadowInstrumentation,
  type ShadowFailureRecord,
} from "../../src/features/runtime-observability-shadow";
import {
  canonicalSignalSnapshot,
  createRuntimeSignalPolicyEngine,
  flushRuntimeObservabilityForTests,
  materializeRuntimeEvidence,
  observeProjectionRefresh,
  runtimePlatformCorrelation,
} from "../../src/features/runtime-observability";

const correlation = runtimePlatformCorrelation([{ type: "command", id: "runtime-projection:organization-runtime" }]);

function pipelineWith(sink: CanonicalSignalSink, failures: ShadowFailureRecord[]) {
  const emitter = createCollectionPipeline({
    registry: canonicalSignalSchemaRegistry,
    policyEngine: createRuntimeSignalPolicyEngine(),
    sinks: new Map([["telemetry", sink]]),
    maxCandidatePayloadBytes: 8_192,
    maxClockDriftMs: 60_000,
    now: () => new Date(),
  });
  const config = createShadowObservabilityConfig({ enabled: true, instrumentationVersion: "1.0.0", environment: "live" });
  return createShadowModeDispatcher({ config, emitter, failureLogger: { record: (failure) => failures.push(failure) } });
}

function observation(overrides: Partial<ProducerObservation> = {}): ProducerObservation {
  return {
    signalId: "runtime-projection.refresh:organization-runtime:1:succeeded",
    signalType: "operational-event",
    schemaVersion: 1,
    producer: { id: "runtime-projection", producerClass: "runtime", version: "1.0.0" },
    source: { component: "organization-runtime", operation: "runtime-projection.refresh" },
    timestamp: new Date().toISOString(),
    correlationCandidates: [{ type: "command", id: "runtime-projection:organization-runtime" }],
    severityCandidate: "info",
    payload: { name: "runtime-projection.refresh", component: "organization-runtime", outcome: "succeeded" },
    metadata: { environment: "live" },
    evidenceCompleteness: "FULL",
    ...overrides,
  };
}

/** A rejected signal must never fail the runtime operation that produced it. */
async function rejectedSignalDoesNotFailRuntime(): Promise<void> {
  const failures: ShadowFailureRecord[] = [];
  const sink = new InMemoryAppendOnlySignalSink({ route: "telemetry", capacity: 10 });
  const dispatcher = pipelineWith(sink, failures);
  // Unknown signal type is rejected by the collection pipeline.
  dispatcher.dispatch(observation({ signalType: "not-a-signal-type" }), correlation);
  await dispatcher.flushForTests();

  assert.equal(sink.query({ platformAuthority: "hebun-dashboard" }, correlation.platformScope).length, 0);
  assert.equal(failures.at(-1)?.category, "collection_rejected");
  assert.equal(failures.at(-1)?.collectionStatus, "rejected_version");

  let runtimeCompleted = false;
  const hooks = createShadowInstrumentationHooks({
    config: createShadowObservabilityConfig({ enabled: true, instrumentationVersion: "1.0.0", environment: "live" }),
    dispatcher,
  });
  const value = runWithShadowInstrumentation(
    {
      started: () => hooks.runtimeStartup({ eventId: "e-1", timestamp: new Date().toISOString(), component: "runtime-projection" }, { correlation }),
      completed: () => { runtimeCompleted = true; },
    },
    () => "runtime-result",
  );
  assert.equal(value, "runtime-result", "runtime result must be unaffected by observability");
  assert.equal(runtimeCompleted, true);
}

/** A sink that throws must not propagate into runtime. */
async function sinkFailureDoesNotFailRuntime(): Promise<void> {
  const failures: ShadowFailureRecord[] = [];
  const explodingSink: CanonicalSignalSink = {
    route: "telemetry",
    async append() { throw new Error("sink exploded with secret detail"); },
  };
  const dispatcher = pipelineWith(explodingSink, failures);
  const result = dispatcher.dispatch(observation(), correlation);
  assert.equal(result.status, "queued");
  await dispatcher.flushForTests();
  assert.equal(failures.at(-1)?.collectionStatus, "sink_unavailable");
  // The recorded failure must not carry the thrown message.
  assert.equal(JSON.stringify(failures).includes("secret detail"), false);

  const value = runWithShadowInstrumentation(
    { started: () => dispatcher.dispatch(observation(), correlation), completed: () => {} },
    () => 42,
  );
  assert.equal(value, 42);
}

/** Runtime operations still throw their own errors; observability never masks them. */
function runtimeErrorsPropagateUnchanged(): void {
  assert.throws(
    () => runWithShadowInstrumentation(
      { started: () => { throw new Error("instrumentation failure"); }, completed: () => { throw new Error("instrumentation failure"); } },
      () => { throw new RangeError("genuine runtime failure"); },
    ),
    RangeError,
  );
}

/** One read model failing must not corrupt or block its siblings. */
async function perReadModelFailureIsolation(): Promise<void> {
  observeProjectionRefresh({
    component: "organization-runtime",
    outcome: "succeeded",
    version: 99,
    observedAt: new Date().toISOString(),
  });
  await flushRuntimeObservabilityForTests();

  // An invalid evaluation time makes monitoring and health unable to resolve a
  // window; diagnostics does not depend on the window and must still succeed.
  const evidence = materializeRuntimeEvidence(new Date("not-a-date"));
  assert.equal(evidence.report.monitoring.status, "failed");
  assert.equal(evidence.report.health.status, "failed");
  assert.equal(evidence.report.diagnostics.status, "materialized");
  assert.equal(evidence.diagnosticsProjections.length > 0, true, "sibling read model must still materialize");
  assert.equal(evidence.monitoringAggregates.length, 0);
  assert.equal(evidence.healthSnapshots.length, 0);

  // Reason codes are stable identifiers, never exception text.
  assert.equal(/^[A-Z_]+$/.test(evidence.report.monitoring.reasonCode ?? ""), true);
  assert.equal(/^[A-Z_]+$/.test(evidence.report.health.reasonCode ?? ""), true);

  // A later valid evaluation recovers with no corruption.
  const recovered = materializeRuntimeEvidence(new Date());
  assert.equal(recovered.report.monitoring.status, "materialized");
  assert.equal(recovered.report.health.status, "materialized");
}

/** Materialization must never throw into its caller. */
async function materializationNeverThrows(): Promise<void> {
  for (const now of [new Date("not-a-date"), new Date(8.64e15 + 1), new Date()]) {
    const evidence = materializeRuntimeEvidence(now);
    assert.equal(typeof evidence.report.signalCount, "number");
  }
  assert.equal(canonicalSignalSnapshot().length > 0, true, "signals survive failed materialization");
}

/**
 * The runtime-facing emit API must never throw, whatever it is handed. This is
 * the guarantee that keeps runtime fail-open independent of any caller-side
 * try/catch.
 */
function runtimeFacingEmitNeverThrows(): void {
  const malformed = [
    { component: "organization-runtime", outcome: "succeeded", version: Number.NaN, observedAt: "not-a-date" },
    { component: "organization-runtime", outcome: "failed", version: -1, observedAt: "" },
    { component: "not-a-component", outcome: "succeeded", version: 1, observedAt: new Date().toISOString() },
    { component: "agent-runtime", outcome: "exploded", version: 1, observedAt: new Date().toISOString() },
    { component: "agent-runtime", outcome: "succeeded", version: 1, observedAt: new Date(0).toISOString() },
  ] as unknown as Parameters<typeof observeProjectionRefresh>[0][];
  for (const input of malformed) {
    const result = observeProjectionRefresh(input);
    assert.equal(["queued", "disabled", "dropped"].includes(result.status), true, "emit must return a typed result");
  }
}

async function main(): Promise<void> {
  runtimeFacingEmitNeverThrows();
  await rejectedSignalDoesNotFailRuntime();
  await sinkFailureDoesNotFailRuntime();
  runtimeErrorsPropagateUnchanged();
  await perReadModelFailureIsolation();
  await materializationNeverThrows();
  console.log("runtime observability failure isolation checks passed");
}

void main();
