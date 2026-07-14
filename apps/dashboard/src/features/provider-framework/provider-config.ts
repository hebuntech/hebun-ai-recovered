import { defaultRetryPolicy } from "@/features/adapters";
import type { ProviderConfig, ProviderConfigField, ProviderTypeKind } from "@/features/provider-framework/types";
import type { AdapterCapabilityKind } from "@/features/adapters";
import { capabilitiesForProviderType } from "@/features/provider-framework/provider-capabilities";

/*
 * provider-config.ts — provider configuration schema + deterministic defaults.
 * Credentials are placeholders only; no secret is ever stored or implemented.
 */
export const CREDENTIALS_PLACEHOLDER = "<injected-at-runtime>";

export const providerConfigSchema: ProviderConfigField[] = [
  { key: "providerId", type: "string", required: true, description: "Unique provider identifier." },
  { key: "providerType", type: "string", required: true, description: "One of the framework provider types." },
  { key: "version", type: "string", required: true, description: "Provider adapter version." },
  { key: "enabled", type: "boolean", required: true, description: "Whether the provider is active." },
  { key: "simulation", type: "boolean", required: true, description: "Run in deterministic simulation mode." },
  { key: "timeoutMs", type: "number", required: true, description: "Execution deadline in ms." },
  { key: "retryPolicy", type: "list", required: false, description: "Retry attempts + backoff." },
  { key: "rateLimits", type: "list", required: false, description: "Requests per minute + burst." },
  { key: "capabilities", type: "list", required: true, description: "Declared SDK capabilities." },
  { key: "featureFlags", type: "list", required: false, description: "Optional feature toggles." },
  { key: "credentials", type: "secret", required: false, description: "Placeholder only — injected at runtime, never stored." },
];

export function defaultConfigFor(
  providerType: ProviderTypeKind,
  providerId: string,
  capabilities?: AdapterCapabilityKind[]
): ProviderConfig {
  return {
    providerId,
    providerType,
    version: "0.1.0",
    enabled: true,
    simulation: true,
    timeoutMs: 30_000,
    retryPolicy: defaultRetryPolicy,
    rateLimits: { requestsPerMinute: 60, burst: 10 },
    capabilities: capabilities ?? capabilitiesForProviderType(providerType),
    featureFlags: [],
    credentialsPlaceholder: CREDENTIALS_PLACEHOLDER,
  };
}
