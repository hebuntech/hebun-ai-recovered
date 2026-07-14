import type { ProviderAdapter, ProviderValidationResult } from "@/features/provider-framework/types";

const CONTRACT_METHODS = ["health", "validate", "normalizeRequest", "normalizeResponse", "normalizeError"] as const;

/*
 * provider-validator.ts — validates a ProviderAdapter against the framework
 * contract. Deterministic; no execution.
 */
export function validateProvider(provider: ProviderAdapter): ProviderValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!provider.metadata?.id) errors.push("metadata.id is required");
  if (!provider.version) errors.push("version is required");
  if (!provider.providerType) errors.push("providerType is required");
  if (!provider.supportedCapabilities?.length) errors.push("at least one supported capability required");
  if (!provider.supportedExecutionModes?.length) errors.push("at least one execution mode required");
  if (!provider.configurationSchema?.length) errors.push("configuration schema is required");

  for (const method of CONTRACT_METHODS) {
    if (typeof (provider as unknown as Record<string, unknown>)[method] !== "function") {
      errors.push(`missing contract method: ${method}()`);
    }
  }

  if (!provider.simulationSupport) warnings.push("provider does not declare simulation support");

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: errors.length === 0 ? "Provider satisfies the framework contract" : "Provider contract incomplete",
  };
}
