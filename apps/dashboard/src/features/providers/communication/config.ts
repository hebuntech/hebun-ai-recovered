import { defaultRetryPolicy } from "@/features/adapters";
import type { ProviderConfigField } from "@/features/provider-framework";
import type { CommunicationConfig } from "@/features/providers/communication/types";

export const communicationConfigSchema: ProviderConfigField[] = [
  { key: "providerId", type: "string", required: true, description: "Fixed Communication provider id." },
  { key: "providerType", type: "string", required: true, description: "Communication Provider framework type." },
  { key: "enabled", type: "boolean", required: true, description: "Enables the offline provider foundation." },
  { key: "simulation", type: "boolean", required: true, description: "Must remain enabled in this phase." },
  { key: "defaultChannel", type: "string", required: true, description: "Deterministic planning channel." },
  { key: "timeoutMs", type: "number", required: true, description: "Simulation timeout budget." },
  { key: "capabilities", type: "list", required: true, description: "Declared communication capabilities." },
  { key: "credentialsPlaceholder", type: "secret", required: false, description: "Placeholder only; never a real secret." },
];

export const communicationConfig: CommunicationConfig = {
  providerId: "communication",
  providerType: "Communication Provider",
  version: "1.0.0",
  enabled: true,
  simulation: true,
  defaultChannel: "internal-simulation",
  timeoutMs: 1000,
  retryPolicy: { ...defaultRetryPolicy, maxAttempts: 1 },
  rateLimits: { requestsPerMinute: 0, burst: 0 },
  capabilities: ["Email", "Calendar", "Messaging", "Search", "Human Approval", "Simulation"],
  featureFlags: ["offline-simulation", "approval-gated", "delivery-plan-preview"],
  credentialsPlaceholder: "No credentials stored. Simulation only.",
  credentialStatus: "placeholder",
};
