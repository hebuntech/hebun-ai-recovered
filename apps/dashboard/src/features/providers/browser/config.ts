import { defaultRetryPolicy } from "@/features/adapters";
import type { ProviderConfigField } from "@/features/provider-framework";
import type { BrowserConfig } from "@/features/providers/browser/types";

export const browserConfigSchema: ProviderConfigField[] = [
  {
    key: "providerId",
    type: "string",
    required: true,
    description: "Fixed provider id for the Browser provider foundation.",
  },
  {
    key: "providerType",
    type: "string",
    required: true,
    description: "Browser-oriented provider type used by the shared framework contract.",
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
    key: "defaultViewport",
    type: "string",
    required: true,
    description: "Placeholder viewport label used for deterministic request planning only.",
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
    description: "Static rate-limit placeholder values. No live navigation or network access.",
  },
  {
    key: "capabilities",
    type: "list",
    required: true,
    description: "Declared future Browser capability coverage.",
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

export const browserConfig: BrowserConfig = {
  providerId: "browser",
  providerType: "Browser Provider",
  version: "1.0.0",
  enabled: true,
  simulation: true,
  defaultViewport: "desktop-1440x900",
  timeoutMs: 1000,
  retryPolicy: {
    ...defaultRetryPolicy,
    maxAttempts: 1,
  },
  rateLimits: {
    requestsPerMinute: 0,
    burst: 0,
  },
  capabilities: ["Browser", "Search", "File System", "Human Approval", "Simulation"],
  featureFlags: ["offline-simulation", "dom-outline-preview", "workflow-plan-preview"],
  credentialsPlaceholder: "No credentials stored. Simulation only.",
  credentialStatus: "placeholder",
};
