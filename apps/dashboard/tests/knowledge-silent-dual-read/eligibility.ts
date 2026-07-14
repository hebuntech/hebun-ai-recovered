import assert from "node:assert/strict";
import {
  evaluateKnowledgeSilentDualReadEligibility,
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

const available = {
  available: true,
  configured: true,
  source: "postgres" as const,
  warnings: [],
};

async function main() {
  assert.deepEqual(
    evaluateKnowledgeSilentDualReadEligibility({
      config: { ...baseConfig, requestedEnabled: false, enabled: false },
      tenantId: "tenant-a",
      requestSampleKey: "req-1",
      canonicalAvailability: available,
    }),
    { eligible: false, reason: "feature-disabled" },
  );

  assert.deepEqual(
    evaluateKnowledgeSilentDualReadEligibility({
      config: { ...baseConfig, enabled: false, killSwitchActive: true },
      tenantId: "tenant-a",
      requestSampleKey: "req-1",
      canonicalAvailability: available,
    }),
    { eligible: false, reason: "kill-switch-active" },
  );

  assert.deepEqual(
    evaluateKnowledgeSilentDualReadEligibility({
      config: baseConfig,
      tenantId: "",
      requestSampleKey: "req-1",
      canonicalAvailability: available,
    }),
    { eligible: false, reason: "missing-tenant" },
  );

  assert.deepEqual(
    evaluateKnowledgeSilentDualReadEligibility({
      config: baseConfig,
      tenantId: "tenant-b",
      requestSampleKey: "req-1",
      canonicalAvailability: available,
    }),
    { eligible: false, reason: "tenant-not-allowed" },
  );

  const sampled = evaluateKnowledgeSilentDualReadEligibility({
    config: { ...baseConfig, sampleRate: 0.5 },
    tenantId: "tenant-a",
    requestSampleKey: "stable-request-key",
    canonicalAvailability: available,
  });
  const sampledAgain = evaluateKnowledgeSilentDualReadEligibility({
    config: { ...baseConfig, sampleRate: 0.5 },
    tenantId: "tenant-a",
    requestSampleKey: "stable-request-key",
    canonicalAvailability: available,
  });
  assert.deepEqual(sampled, sampledAgain);

  assert.deepEqual(
    evaluateKnowledgeSilentDualReadEligibility({
      config: baseConfig,
      tenantId: "tenant-a",
      requestSampleKey: "req-1",
      canonicalAvailability: {
        available: false,
        configured: false,
        source: "postgres",
        warnings: [],
      },
    }),
    { eligible: false, reason: "canonical-read-unavailable" },
  );

  assert.deepEqual(
    evaluateKnowledgeSilentDualReadEligibility({
      config: baseConfig,
      tenantId: "tenant-a",
      requestSampleKey: "req-1",
      canonicalAvailability: available,
    }),
    { eligible: true },
  );

  console.log("knowledge-silent-dual-read eligibility checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
