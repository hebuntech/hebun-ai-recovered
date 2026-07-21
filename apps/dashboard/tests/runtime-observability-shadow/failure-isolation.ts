import assert from "node:assert/strict";
import type { SignalEmitter } from "../../src/features/observability";
import {
  createShadowModeDispatcher,
  createShadowObservabilityConfig,
  runWithShadowInstrumentation,
  type ShadowFailureRecord,
} from "../../src/features/runtime-observability-shadow";
import { metricObservation, tenantContext } from "../helpers/observability-collection";

async function main(): Promise<void> {
  const runtimeResult = Object.freeze({ authority: "unchanged" });
  assert.equal(runWithShadowInstrumentation({
    started() { throw new Error("observability unavailable"); },
    completed() { throw new Error("observability unavailable"); },
  }, () => runtimeResult), runtimeResult);

  const runtimeError = new Error("runtime failure");
  assert.throws(() => runWithShadowInstrumentation({ started() {}, completed() { throw new Error("shadow failure"); } }, () => {
    throw runtimeError;
  }), (error) => error === runtimeError);

  const promise = Promise.resolve(runtimeResult);
  const returnedPromise = runWithShadowInstrumentation({ started() {}, completed() { throw new Error("shadow failure"); } }, () => promise);
  assert.equal(returnedPromise, promise);
  assert.equal(await returnedPromise, runtimeResult);

  const failures: ShadowFailureRecord[] = [];
  let releaseCollection: (() => void) | undefined;
  const pendingCollection = new Promise<void>((resolve) => { releaseCollection = resolve; });
  const nonBlockingDispatcher = createShadowModeDispatcher({
    config: createShadowObservabilityConfig({ enabled: true, instrumentationVersion: "1.0.0", environment: "simulation" }),
    emitter: {
      async submit(observation) {
        await pendingCollection;
        return { status: "accepted", signalId: observation.signalId, routes: ["telemetry"] };
      },
    },
    failureLogger: { record: (failure) => failures.push(failure) },
  });
  assert.deepEqual(nonBlockingDispatcher.dispatch(metricObservation(), tenantContext), { status: "queued", signalId: "signal-1" });
  releaseCollection?.();
  await nonBlockingDispatcher.flushForTests();

  const rejectedEmitter: SignalEmitter = {
    async submit() { throw new Error("collection offline"); },
  };
  const config = createShadowObservabilityConfig({ enabled: true, instrumentationVersion: "1.0.0", environment: "simulation" });
  const dispatcher = createShadowModeDispatcher({ config, emitter: rejectedEmitter, failureLogger: { record: (failure) => failures.push(failure) } });
  assert.equal(dispatcher.dispatch(metricObservation(), tenantContext).status, "queued");
  await dispatcher.flushForTests();
  assert.deepEqual(failures, [{ signalId: "signal-1", category: "dispatcher_failure" }]);

  const throwingLoggerDispatcher = createShadowModeDispatcher({
    config,
    emitter: { async submit() { throw new Error("collection offline"); } },
    failureLogger: { record() { throw new Error("logger offline"); } },
  });
  assert.doesNotThrow(() => throwingLoggerDispatcher.dispatch(metricObservation(), tenantContext));
  await throwingLoggerDispatcher.flushForTests();

  console.log("runtime observability shadow failure isolation checks passed");
}

void main();
