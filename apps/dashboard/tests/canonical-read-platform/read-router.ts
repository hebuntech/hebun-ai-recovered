import assert from "node:assert/strict";
import {
  getLatestReadRouterObservation,
  runReadRouter,
} from "../../src/features/canonical-read-platform";

async function main() {
  const result = await runReadRouter({
    domain: "router-test",
    authoritativeProvider: "memory",
    executeAuthoritative: async () => ({ source: "memory", value: 42 }),
    planShadow: () => ({
      routingDecision: "authoritative-with-shadow",
      rolloutDecision: "shadow-enabled",
      invokeShadowParticipant: true,
      shadowProvider: "postgres",
    }),
    invokeShadowParticipant: (_result, handlers) => {
      handlers.complete({ status: "matched" });
    },
    describeShadowObservation: (observation: { status: string }) =>
      observation.status,
  });

  assert.deepEqual(result, { source: "memory", value: 42 });

  const observation = getLatestReadRouterObservation("router-test");
  assert.equal(observation?.authoritativeProvider, "memory");
  assert.equal(observation?.shadowProvider, "postgres");
  assert.equal(observation?.routingDecision, "authoritative-with-shadow");
  assert.equal(observation?.comparisonStatus, "matched");

  console.log("canonical-read-platform read router checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
