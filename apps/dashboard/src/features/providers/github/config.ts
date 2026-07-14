import { defaultRetryPolicy } from "@/features/adapters";
import type { ProviderConfigField } from "@/features/provider-framework";
import type { GitHubConfig } from "@/features/providers/github/types";

export const githubConfigSchema: ProviderConfigField[] = [
  {
    key: "providerId",
    type: "string",
    required: true,
    description: "Fixed provider id for the GitHub provider foundation.",
  },
  {
    key: "providerType",
    type: "string",
    required: true,
    description: "Repository-oriented provider type used by the shared framework contract.",
  },
  {
    key: "enabled",
    type: "boolean",
    required: true,
    description: "Enables or disables the offline provider foundation.",
  },
  {
    key: "simulation",
    type: "boolean",
    required: true,
    description: "Must remain enabled because this phase supports simulation only.",
  },
  {
    key: "defaultRepository",
    type: "string",
    required: true,
    description: "Placeholder repository label for deterministic UI and request normalization only.",
  },
  {
    key: "timeoutMs",
    type: "number",
    required: true,
    description: "Deterministic timeout budget for simulated provider outputs.",
  },
  {
    key: "retryPolicy",
    type: "list",
    required: true,
    description: "Retry policy placeholder used for contract completeness only.",
  },
  {
    key: "rateLimits",
    type: "list",
    required: true,
    description: "Static rate-limit placeholder values. No live enforcement or network access.",
  },
  {
    key: "capabilities",
    type: "list",
    required: true,
    description: "Declared future GitHub capability coverage.",
  },
  {
    key: "featureFlags",
    type: "list",
    required: false,
    description: "Optional offline provider feature toggles.",
  },
  {
    key: "credentialsPlaceholder",
    type: "secret",
    required: false,
    description: "Placeholder only. No real credential handling exists.",
  },
  {
    key: "credentialStatus",
    type: "secret",
    required: false,
    description: "Deterministic status label for the placeholder credential posture.",
  },
];

export const githubConfig: GitHubConfig = {
  providerId: "github",
  providerType: "Repository Provider",
  version: "1.0.0",
  enabled: true,
  simulation: true,
  defaultRepository: "hebun-ai/dashboard",
  timeoutMs: 1200,
  retryPolicy: {
    ...defaultRetryPolicy,
    maxAttempts: 1,
  },
  rateLimits: {
    requestsPerMinute: 0,
    burst: 0,
  },
  capabilities: ["Repository", "File System", "Search", "Human Approval", "Simulation"],
  featureFlags: ["offline-simulation", "governance-review-preview", "pull-request-analysis-preview"],
  credentialsPlaceholder: "No credentials stored. Simulation only.",
  credentialStatus: "placeholder",
};
