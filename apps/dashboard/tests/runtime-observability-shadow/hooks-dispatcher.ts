import assert from "node:assert/strict";
import type {
  ProducerObservation,
  RequestCorrelationContext,
  SignalEmitter,
} from "../../src/features/observability";
import {
  createShadowInstrumentationHooks,
  createShadowModeDispatcher,
  createShadowObservabilityConfig,
  type ShadowFailureRecord,
} from "../../src/features/runtime-observability-shadow";
import { tenantContext } from "../helpers/observability-collection";

const event = Object.freeze({
  eventId: "event-1",
  timestamp: "2026-07-21T12:00:00.000Z",
  component: "runtime-engine",
});

async function main(): Promise<void> {
  const submissions: Array<{ observation: ProducerObservation; context: RequestCorrelationContext }> = [];
  const failures: ShadowFailureRecord[] = [];
  const emitter: SignalEmitter = {
    async submit(observation, context) {
      submissions.push({ observation, context });
      return { status: "accepted", signalId: observation.signalId, routes: ["telemetry"] };
    },
  };
  const config = createShadowObservabilityConfig({ enabled: true, instrumentationVersion: "1.0.0", environment: "live" });
  const dispatcher = createShadowModeDispatcher({ config, emitter, failureLogger: { record: (failure) => failures.push(failure) } });
  const hooks = createShadowInstrumentationHooks({ config, dispatcher });
  const context = { correlation: tenantContext };

  const results = [
    hooks.runtimeStartup(event, context), hooks.runtimeShutdown(event, context),
    hooks.agentCreated(event, context), hooks.agentFinished(event, context),
    hooks.workflowStarted(event, context), hooks.workflowCompleted(event, context),
    hooks.toolStarted(event, context), hooks.toolCompleted(event, context),
    hooks.memoryRead(event, context), hooks.memoryWrite(event, context),
    hooks.authenticationSucceeded(event, context), hooks.authenticationFailed({ ...event, reasonCode: "AUTH_REJECTED" }, context),
  ];
  assert.equal(results.every((result) => result.status === "queued"), true);
  await dispatcher.flushForTests();
  assert.equal(submissions.length, 12);
  assert.equal(failures.length, 0);
  assert.equal(submissions.every(({ context: submitted }) => submitted === tenantContext), true);
  assert.equal(submissions.every(({ observation }) => observation.tenantIdCandidate === "tenant-a"), true);
  assert.deepEqual(submissions[0]?.observation.correlationCandidates, tenantContext.relationships.map(
    ({ type, id, tenantId }) => ({ type, id, tenantId, parentId: undefined }),
  ));
  assert.deepEqual(submissions[8]?.observation.payload, {
    name: "memory.read", component: "runtime-engine", outcome: "succeeded",
  });
  assert.deepEqual(Object.keys(submissions[8]?.observation.payload as object).sort(), ["component", "name", "outcome"]);

  const disabledConfig = createShadowObservabilityConfig({ enabled: false, instrumentationVersion: "1.0.0", environment: "live" });
  const disabledDispatcher = createShadowModeDispatcher({ config: disabledConfig, emitter, failureLogger: { record() {} } });
  const disabledHooks = createShadowInstrumentationHooks({ config: disabledConfig, dispatcher: disabledDispatcher });
  assert.deepEqual(disabledHooks.toolStarted(event, context), { status: "disabled" });
  await disabledDispatcher.flushForTests();
  assert.equal(submissions.length, 12);

  console.log("runtime observability shadow hook and dispatcher checks passed");
}

void main();
