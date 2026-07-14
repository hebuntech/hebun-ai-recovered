import assert from "node:assert/strict";
import {
  KNOWLEDGE_SILENT_DUAL_READ_EXPERIMENT_VERSION,
  createKnowledgeSilentDualReadMetricsSink,
} from "../../src/features/knowledge-silent-dual-read";

async function main() {
  const devSink = createKnowledgeSilentDualReadMetricsSink({
    NODE_ENV: "development",
  });
  assert.equal(devSink.sinkType, "in-memory");
  devSink.increment("shadow_rollout_enabled_count", {
    environment: "development",
    experimentVersion: KNOWLEDGE_SILENT_DUAL_READ_EXPERIMENT_VERSION,
  });
  devSink.increment("shadow_knowledge_eligible_count", {
    environment: "development",
    experimentVersion: KNOWLEDGE_SILENT_DUAL_READ_EXPERIMENT_VERSION,
  });
  devSink.observeLatency(12, {
    environment: "development",
    experimentVersion: KNOWLEDGE_SILENT_DUAL_READ_EXPERIMENT_VERSION,
  });
  assert.equal(
    devSink.snapshot().counters.shadow_rollout_enabled_count,
    1,
  );
  assert.equal(
    devSink.snapshot().counters.shadow_knowledge_eligible_count,
    1,
  );
  assert.deepEqual(devSink.snapshot().latencySamples, [12]);

  const prodSink = createKnowledgeSilentDualReadMetricsSink({
    NODE_ENV: "production",
  });
  assert.equal(prodSink.sinkType, "noop");
  prodSink.increment("shadow_knowledge_error_count", {
    environment: "production",
    experimentVersion: KNOWLEDGE_SILENT_DUAL_READ_EXPERIMENT_VERSION,
  });
  assert.equal(prodSink.snapshot().counters.shadow_knowledge_error_count, 0);

  console.log("knowledge-silent-dual-read metrics checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
