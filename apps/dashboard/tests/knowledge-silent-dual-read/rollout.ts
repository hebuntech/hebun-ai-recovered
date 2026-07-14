import assert from "node:assert/strict";
import {
  evaluateKnowledgeSilentDualReadRollout,
  summarizeKnowledgeSilentDualReadRolloutForDiagnostics,
  type KnowledgeSilentDualReadConfig,
} from "../../src/features/knowledge-silent-dual-read";

const baseConfig: KnowledgeSilentDualReadConfig = {
  requestedEnabled: true,
  enabled: true,
  killSwitchActive: false,
  allowlistCount: 1,
  sampleRate: 1,
  timeoutMs: 100,
  metricsSink: "in-memory",
  valid: true,
  reasons: [],
  allowlistedTenants: new Set(["tenant-a"]),
};

async function main() {
  assert.deepEqual(
    evaluateKnowledgeSilentDualReadRollout({
      config: { ...baseConfig, requestedEnabled: false, enabled: false },
      tenantId: "tenant-a",
      requestSampleKey: "req-1",
    }),
    {
      enabled: false,
      sampled: false,
      tenantEligible: false,
      shouldRun: false,
      reason: "feature-disabled",
    },
  );

  assert.deepEqual(
    evaluateKnowledgeSilentDualReadRollout({
      config: { ...baseConfig, enabled: false, killSwitchActive: true },
      tenantId: "tenant-a",
      requestSampleKey: "req-1",
    }),
    {
      enabled: false,
      sampled: false,
      tenantEligible: false,
      shouldRun: false,
      reason: "kill-switch-active",
    },
  );

  const sampled = evaluateKnowledgeSilentDualReadRollout({
    config: { ...baseConfig, sampleRate: 0.5 },
    tenantId: "tenant-a",
    requestSampleKey: "stable-request-key",
  });
  const sampledAgain = evaluateKnowledgeSilentDualReadRollout({
    config: { ...baseConfig, sampleRate: 0.5 },
    tenantId: "tenant-a",
    requestSampleKey: "stable-request-key",
  });
  assert.deepEqual(sampled, sampledAgain);

  const diagnostics = summarizeKnowledgeSilentDualReadRolloutForDiagnostics({
    config: { ...baseConfig, sampleRate: 0.25 },
    tenantId: "tenant-a",
    requestSampleKey: "stable-request-key",
  });
  assert.equal(diagnostics.samplePercentage, 25);
  assert.equal(diagnostics.killSwitchActive, false);

  console.log("knowledge-silent-dual-read rollout checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
