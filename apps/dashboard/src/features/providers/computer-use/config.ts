import { defaultRetryPolicy } from "@/features/adapters";
import type { ProviderConfigField } from "@/features/provider-framework";
import type { ComputerUseConfig } from "@/features/providers/computer-use/types";

export const computerUseConfigSchema: ProviderConfigField[] = [
  {
    key: "providerId",
    type: "string",
    required: true,
    description: "Fixed provider id for the Computer Use provider foundation.",
  },
  {
    key: "providerType",
    type: "string",
    required: true,
    description: "Computer Use oriented provider type used by the shared framework contract.",
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
    key: "defaultEnvironment",
    type: "string",
    required: true,
    description: "Placeholder environment label used for deterministic planning only.",
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
    description: "Static rate-limit placeholder values. No live OS or network access.",
  },
  {
    key: "capabilities",
    type: "list",
    required: true,
    description: "Declared future Computer Use capability coverage.",
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

export const computerUseConfig: ComputerUseConfig = {
  providerId: "computer-use",
  providerType: "Computer Use Provider",
  version: "1.0.0",
  enabled: true,
  simulation: true,
  defaultEnvironment: "managed-workstation-simulation",
  timeoutMs: 1100,
  retryPolicy: {
    ...defaultRetryPolicy,
    maxAttempts: 1,
  },
  rateLimits: {
    requestsPerMinute: 0,
    burst: 0,
  },
  capabilities: ["Terminal", "File System", "Search", "Human Approval", "Simulation"],
  featureFlags: ["offline-simulation", "session-plan-preview", "safety-gate-preview"],
  credentialsPlaceholder: "No credentials stored. Simulation only.",
  credentialStatus: "placeholder",
};
