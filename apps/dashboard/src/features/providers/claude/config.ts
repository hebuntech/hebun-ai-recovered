import { defaultRetryPolicy } from "@/features/adapters";
import type { ProviderConfigField } from "@/features/provider-framework";
import type { ClaudeConfig } from "@/features/providers/claude/types";

export const claudeConfigSchema: ProviderConfigField[] = [
  {
    key: "defaultModel",
    type: "string",
    required: true,
    description: "Placeholder Claude model identifier used only in simulation mode.",
  },
  {
    key: "credentialStatus",
    type: "secret",
    required: false,
    description: "Credential placeholder only. No real key storage or runtime usage.",
  },
  {
    key: "simulation",
    type: "boolean",
    required: true,
    description: "Must remain enabled because the Claude provider foundation is offline-only.",
  },
  {
    key: "timeoutMs",
    type: "number",
    required: true,
    description: "Deterministic execution timeout budget for simulated provider responses.",
  },
];

export const claudeConfig: ClaudeConfig = {
  providerId: "claude",
  providerType: "LLM Provider",
  version: "1.0.0",
  enabled: true,
  simulation: true,
  timeoutMs: 1200,
  retryPolicy: {
    ...defaultRetryPolicy,
    maxAttempts: 1,
  },
  rateLimits: {
    requestsPerMinute: 0,
    burst: 0,
  },
  capabilities: ["Code Generation", "Search", "File System", "Terminal", "Human Approval", "Simulation"],
  featureFlags: ["offline-simulation", "structured-output", "tool-plan-preview"],
  credentialsPlaceholder: "No credentials stored. Simulation only.",
  defaultModel: "claude-simulation-v1",
  credentialStatus: "placeholder",
};
