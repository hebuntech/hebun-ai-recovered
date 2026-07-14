import { providerConfigSchema } from "@/features/provider-framework/provider-config";
import {
  normalizeRequest,
  normalizeResponse,
  normalizeError,
} from "@/features/provider-framework/provider-normalization";
import type {
  ProviderAdapter,
  ProviderConfig,
  ProviderHealth,
  ProviderMetadata,
  ProviderValidationResult,
} from "@/features/provider-framework/types";
import type { AdapterCapabilityKind } from "@/features/adapters";

/*
 * provider-contract.ts — reference ProviderAdapter implementation.
 *
 * A deterministic conformance fixture used to validate the framework itself.
 * It is NOT a real provider: no external calls, no credentials, simulation only.
 * Real providers implement this same ProviderAdapter contract in later phases.
 */

const referenceMetadata: ProviderMetadata = {
  id: "reference-simulation-provider",
  name: "Reference Simulation Provider",
  version: "1.0.0",
  providerType: "Automation Provider",
  vendor: "Hebun AI",
  description:
    "Deterministic reference implementation of the ProviderAdapter contract. Used for framework conformance and pipeline validation. Not a real provider.",
  simulation: true,
};

const referenceCapabilities: AdapterCapabilityKind[] = ["Simulation", "File System", "Terminal"];

export const referenceProvider: ProviderAdapter = {
  metadata: referenceMetadata,
  version: referenceMetadata.version,
  providerType: referenceMetadata.providerType,
  supportedCapabilities: referenceCapabilities,
  supportedExecutionModes: ["simulation"],
  configurationSchema: providerConfigSchema,
  simulationSupport: true,

  health(): ProviderHealth {
    return { status: "Healthy", availability: 100, latencyMs: 40, note: "Deterministic reference provider" };
  },

  validate(config: ProviderConfig): ProviderValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    if (!config.providerId) errors.push("providerId is required");
    if (!config.providerType) errors.push("providerType is required");
    if (!config.capabilities.length) errors.push("at least one capability required");
    if (!config.simulation) warnings.push("Reference provider only supports simulation mode");
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      summary: errors.length === 0 ? "Configuration valid" : "Configuration invalid",
    };
  },

  normalizeRequest,
  normalizeResponse,
  normalizeError,
};
