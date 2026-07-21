import assert from "node:assert/strict";
import { ensureRuntimeProjectionRegistry } from "../../src/features/runtime-projection";
import {
  canonicalSignalSnapshot,
  flushRuntimeObservabilityForTests,
  INSTRUMENTED_COMPONENTS,
  observabilityFailures,
  observeProjectionRefresh,
  PLATFORM_AUTHORITY,
} from "../../src/features/runtime-observability";

/** Real runtime activity: bootstrapping the runtime projection registry. */
async function liveRuntimeActivityEmitsAcceptedSignals(): Promise<void> {
  ensureRuntimeProjectionRegistry();
  await flushRuntimeObservabilityForTests();
  const signals = canonicalSignalSnapshot();
  assert.equal(signals.length > 0, true, "runtime activity must produce canonical signals");
  assert.deepEqual(observabilityFailures(), [], "no collection failures expected for runtime bootstrap");

  for (const component of INSTRUMENTED_COMPONENTS) {
    const emitted = signals.filter((signal) => signal.source.component === component);
    assert.equal(emitted.length >= 1, true, `${component} must emit a refresh signal`);
    assert.equal(emitted.every((signal) => signal.source.operation === "runtime-projection.refresh"), true);
    assert.equal(emitted.every((signal) => signal.signalType === "operational-event"), true);
  }
}

/** Signals are platform-scoped; no tenant identity may appear. */
async function preservesPlatformScope(): Promise<void> {
  const signals = canonicalSignalSnapshot();
  for (const signal of signals) {
    assert.equal(signal.platformScope.kind, "platform");
    assert.equal(signal.platformScope.kind === "platform" && signal.platformScope.authority, PLATFORM_AUTHORITY);
    assert.equal(signal.tenantScope.kind, "none");
    for (const relationship of signal.correlation.relationships) {
      assert.equal(relationship.tenantId, undefined, "platform signals must carry no tenant id");
      assert.equal(relationship.resolvedBy, "server");
    }
  }
}

/** Correlation is propagated from existing runtime identifiers. */
async function propagatesCorrelation(): Promise<void> {
  const signals = canonicalSignalSnapshot();
  for (const component of INSTRUMENTED_COMPONENTS) {
    const signal = signals.find((candidate) => candidate.source.component === component);
    assert.notEqual(signal, undefined);
    assert.deepEqual(
      signal!.correlation.relationships.map(({ type, id }) => ({ type, id })),
      [{ type: "command", id: `runtime-projection:${component}` }],
    );
  }
}

/** The sink is append-only and hands back immutable records. */
async function sinkIsAppendOnlyAndImmutable(): Promise<void> {
  const signals = canonicalSignalSnapshot();
  assert.equal(Object.isFrozen(signals), true);
  for (const signal of signals) assert.equal(Object.isFrozen(signal), true);
  assert.throws(() => {
    (signals as unknown as { push: (value: unknown) => void }).push({});
  }, "signal snapshot must not be extendable");
  // Mutating a returned record must not be possible.
  const first = signals[0]!;
  assert.throws(() => {
    (first as unknown as { signalId: string }).signalId = "tampered";
  });
  assert.notEqual(first.signalId, "tampered");
}

/** Ordering is deterministic across reads. */
async function deterministicOrdering(): Promise<void> {
  assert.deepEqual(
    canonicalSignalSnapshot().map(({ signalId }) => signalId),
    canonicalSignalSnapshot().map(({ signalId }) => signalId),
  );
}

/**
 * Duplicate handling: identical delivery is deduplicated by signal identity,
 * which is derived from existing identifiers rather than random values.
 */
async function duplicateDeliveryDoesNotDoubleCount(): Promise<void> {
  const before = canonicalSignalSnapshot().length;
  const observation = {
    component: INSTRUMENTED_COMPONENTS[0],
    outcome: "succeeded" as const,
    version: 1,
    observedAt: new Date().toISOString(),
  };
  assert.equal(observeProjectionRefresh(observation).status, "queued");
  await flushRuntimeObservabilityForTests();
  assert.equal(observeProjectionRefresh(observation).status, "queued");
  await flushRuntimeObservabilityForTests();

  const after = canonicalSignalSnapshot();
  assert.equal(after.length, before, "replaying the same refresh must not add signals");
  const ids = after.map(({ signalId }) => signalId);
  assert.equal(new Set(ids).size, ids.length, "signal ids must be unique in the sink");
}

async function main(): Promise<void> {
  await liveRuntimeActivityEmitsAcceptedSignals();
  await preservesPlatformScope();
  await propagatesCorrelation();
  await sinkIsAppendOnlyAndImmutable();
  await deterministicOrdering();
  await duplicateDeliveryDoesNotDoubleCount();
  console.log("runtime observability signal production checks passed");
}

void main();
