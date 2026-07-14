import { defaultRetryPolicy } from "@/features/adapters";
import type { ProviderConfigField } from "@/features/provider-framework";
import type { CodexConfig } from "@/features/providers/codex/types";

export const codexConfigSchema: ProviderConfigField[] = [
  { key: "providerId", type: "string", required: true, description: "Fixed provider id for the Codex provider foundation." },
  { key: "providerType", type: "string", required: true, description: "Automation-oriented provider type used by the shared framework contract." },
  { key: "enabled", type: "boolean", required: true, description: "Enables or disables the offline provider foundation." },
  { key: "simulation", type: "boolean", required: true, description: "Must remain enabled because this phase supports simulation only." },
  { key: "defaultModel", type: "string", required: true, description: "Placeholder model label for deterministic UI and request normalization only." },
  { key: "timeoutMs", type: "number", required: true, description: "Deterministic timeout budget for simulated provider outputs." },
  { key: "retryPolicy", type: "list", required: true, description: "Retry policy placeholder used for contract completeness only." },
  { key: "rateLimits", type: "list", required: true, description: "Static rate-limit placeholder values. No live enforcement or network access." },
  { key: "capabilities", type: "list", required: true, description: "Declared future Codex capability coverage." },
  { key: "featureFlags", type: "list", required: false, description: "Optional offline provider feature toggles." },
  { key: "credentialsPlaceholder", type: "secret", required: false, description: "Placeholder only. No real credential handling exists." },
  { key: "credentialStatus", type: "secret", required: false, description: "Deterministic status label for the placeholder credential posture." },
];

export const codexConfig: CodexConfig = {
  providerId: "codex",
  providerType: "Automation Provider",
  version: "1.0.0",
  enabled: true,
  simulation: true,
  defaultModel: "codex-simulation-v1",
  timeoutMs: 1500,
  retryPolicy: {
    ...defaultRetryPolicy,
    maxAttempts: 1,
  },
  rateLimits: {
    requestsPerMinute: 0,
    burst: 0,
  },
  capabilities: ["Code Generation", "Repository", "Terminal", "Search", "File System", "Human Approval", "Simulation"],
  featureFlags: ["offline-simulation", "patch-plan-preview", "repo-analysis-preview"],
  credentialsPlaceholder: "No credentials stored. Simulation only.",
  credentialStatus: "placeholder",
};
