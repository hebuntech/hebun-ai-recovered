import {
  KNOWLEDGE_SILENT_DUAL_READ_MAX_TIMEOUT_MS,
  type KnowledgeSilentDualReadConfig,
} from "./types";

export const ENABLE_KNOWLEDGE_SILENT_DUAL_READ_ENV =
  "HEBUN_ENABLE_KNOWLEDGE_SILENT_DUAL_READ";
export const DISABLE_KNOWLEDGE_SILENT_DUAL_READ_ENV =
  "HEBUN_DISABLE_KNOWLEDGE_SILENT_DUAL_READ";
export const KNOWLEDGE_DUAL_READ_TENANT_ALLOWLIST_ENV =
  "HEBUN_KNOWLEDGE_DUAL_READ_TENANT_ALLOWLIST";
export const KNOWLEDGE_DUAL_READ_SAMPLE_RATE_ENV =
  "HEBUN_KNOWLEDGE_DUAL_READ_SAMPLE_RATE";
export const KNOWLEDGE_DUAL_READ_TIMEOUT_MS_ENV =
  "HEBUN_KNOWLEDGE_DUAL_READ_TIMEOUT_MS";

function parseAllowlist(value?: string): ReadonlySet<string> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
  );
}

function parseSampleRate(value?: string): {
  readonly value: number;
  readonly valid: boolean;
} {
  if (!value?.trim()) {
    return { value: 0, valid: true };
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    return { value: 0, valid: false };
  }

  return { value: parsed, valid: true };
}

function parseTimeoutMs(value?: string): {
  readonly value: number;
  readonly valid: boolean;
} {
  if (!value?.trim()) {
    return { value: 100, valid: true };
  }

  const parsed = Number(value);
  if (
    !Number.isFinite(parsed) ||
    parsed <= 0 ||
    parsed > KNOWLEDGE_SILENT_DUAL_READ_MAX_TIMEOUT_MS
  ) {
    return { value: 100, valid: false };
  }

  return { value: Math.floor(parsed), valid: true };
}

export function readKnowledgeSilentDualReadConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): KnowledgeSilentDualReadConfig {
  const requestedEnabled = env[ENABLE_KNOWLEDGE_SILENT_DUAL_READ_ENV] === "true";
  const killSwitchActive =
    env[DISABLE_KNOWLEDGE_SILENT_DUAL_READ_ENV] === "true";
  const allowlistedTenants = parseAllowlist(
    env[KNOWLEDGE_DUAL_READ_TENANT_ALLOWLIST_ENV],
  );
  const sampleRate = parseSampleRate(env[KNOWLEDGE_DUAL_READ_SAMPLE_RATE_ENV]);
  const timeoutMs = parseTimeoutMs(env[KNOWLEDGE_DUAL_READ_TIMEOUT_MS_ENV]);

  const reasons: string[] = [];
  if (!sampleRate.valid) {
    reasons.push(
      `${KNOWLEDGE_DUAL_READ_SAMPLE_RATE_ENV} must be between 0 and 1.`,
    );
  }
  if (!timeoutMs.valid) {
    reasons.push(
      `${KNOWLEDGE_DUAL_READ_TIMEOUT_MS_ENV} must be between 1 and ${KNOWLEDGE_SILENT_DUAL_READ_MAX_TIMEOUT_MS}.`,
    );
  }
  if (requestedEnabled && allowlistedTenants.size === 0) {
    reasons.push(
      `${KNOWLEDGE_DUAL_READ_TENANT_ALLOWLIST_ENV} must contain at least one tenant when the experiment is enabled.`,
    );
  }

  const valid = reasons.length === 0;
  const metricsSink = env.NODE_ENV === "production" ? "noop" : "in-memory";

  return {
    requestedEnabled,
    enabled:
      requestedEnabled &&
      valid &&
      allowlistedTenants.size > 0 &&
      !killSwitchActive,
    killSwitchActive,
    allowlistCount: allowlistedTenants.size,
    sampleRate: sampleRate.value,
    timeoutMs: timeoutMs.value,
    metricsSink,
    valid,
    reasons,
    allowlistedTenants,
  };
}
