import assert from "node:assert/strict";
import {
  DISABLE_KNOWLEDGE_SILENT_DUAL_READ_ENV,
  ENABLE_KNOWLEDGE_SILENT_DUAL_READ_ENV,
  KNOWLEDGE_DUAL_READ_SAMPLE_RATE_ENV,
  KNOWLEDGE_DUAL_READ_TENANT_ALLOWLIST_ENV,
  KNOWLEDGE_DUAL_READ_TIMEOUT_MS_ENV,
  readKnowledgeSilentDualReadConfigFromEnv,
} from "../../src/features/knowledge-silent-dual-read";

async function main() {
  const disabled = readKnowledgeSilentDualReadConfigFromEnv(
    {} as NodeJS.ProcessEnv,
  );
  assert.equal(disabled.enabled, false);
  assert.equal(disabled.requestedEnabled, false);
  assert.equal(disabled.killSwitchActive, false);
  assert.equal(disabled.valid, true);
  assert.equal(disabled.allowlistCount, 0);
  assert.equal(disabled.sampleRate, 0);
  assert.equal(disabled.timeoutMs, 100);

  const enabled = readKnowledgeSilentDualReadConfigFromEnv(
    {
      [ENABLE_KNOWLEDGE_SILENT_DUAL_READ_ENV]: "true",
      [KNOWLEDGE_DUAL_READ_TENANT_ALLOWLIST_ENV]:
        "11111111-1111-4111-8111-111111111111",
      [KNOWLEDGE_DUAL_READ_SAMPLE_RATE_ENV]: "0.25",
      [KNOWLEDGE_DUAL_READ_TIMEOUT_MS_ENV]: "75",
    } as unknown as NodeJS.ProcessEnv,
  );
  assert.equal(enabled.enabled, true);
  assert.equal(enabled.requestedEnabled, true);
  assert.equal(enabled.killSwitchActive, false);
  assert.equal(enabled.valid, true);
  assert.equal(enabled.allowlistCount, 1);
  assert.equal(enabled.sampleRate, 0.25);
  assert.equal(enabled.timeoutMs, 75);

  const invalid = readKnowledgeSilentDualReadConfigFromEnv(
    {
      [ENABLE_KNOWLEDGE_SILENT_DUAL_READ_ENV]: "true",
      [KNOWLEDGE_DUAL_READ_SAMPLE_RATE_ENV]: "2",
      [KNOWLEDGE_DUAL_READ_TIMEOUT_MS_ENV]: "900",
    } as unknown as NodeJS.ProcessEnv,
  );
  assert.equal(invalid.enabled, false);
  assert.equal(invalid.valid, false);
  assert.ok(invalid.reasons.length >= 2);

  const killed = readKnowledgeSilentDualReadConfigFromEnv(
    {
      [ENABLE_KNOWLEDGE_SILENT_DUAL_READ_ENV]: "true",
      [DISABLE_KNOWLEDGE_SILENT_DUAL_READ_ENV]: "true",
      [KNOWLEDGE_DUAL_READ_TENANT_ALLOWLIST_ENV]:
        "11111111-1111-4111-8111-111111111111",
      [KNOWLEDGE_DUAL_READ_SAMPLE_RATE_ENV]: "1",
    } as unknown as NodeJS.ProcessEnv,
  );
  assert.equal(killed.requestedEnabled, true);
  assert.equal(killed.killSwitchActive, true);
  assert.equal(killed.enabled, false);

  console.log("knowledge-silent-dual-read config checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
