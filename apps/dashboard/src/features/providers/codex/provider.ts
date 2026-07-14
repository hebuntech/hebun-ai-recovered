import type { AdapterCapabilityKind, AdapterError } from "@/features/adapters";
import type {
  NormalizedRequest,
  NormalizedResponse,
  ProviderAdapter,
  ProviderConfig,
  ProviderHealth,
  ProviderValidationResult,
} from "@/features/provider-framework";
import { codexConfig, codexConfigSchema } from "@/features/providers/codex/config";
import { codexProviderHealth } from "@/features/providers/codex/health";
import {
  CODEX_PROVIDER_FAMILY,
  CODEX_PROVIDER_ID,
  CODEX_PROVIDER_NAME,
} from "@/features/providers/codex/types";

const supportedCapabilities: AdapterCapabilityKind[] = [
  "Code Generation",
  "Repository",
  "Terminal",
  "Search",
  "File System",
  "Human Approval",
  "Simulation",
];

export const codexProvider: ProviderAdapter = {
  metadata: {
    id: CODEX_PROVIDER_ID,
    name: `${CODEX_PROVIDER_NAME} Provider`,
    version: "1.0.0",
    providerType: "Automation Provider",
    vendor: CODEX_PROVIDER_FAMILY,
    description:
      "Offline Codex provider foundation for code, repository, refactor, test, build, and developer workflow scenarios. Simulation only, with no network, SDK, credentials, shell execution, or repository mutation.",
    simulation: true,
  },
  version: "1.0.0",
  providerType: "Automation Provider",
  supportedCapabilities,
  supportedExecutionModes: ["simulation"],
  configurationSchema: codexConfigSchema,
  simulationSupport: true,

  health(): ProviderHealth {
    return codexProviderHealth;
  },

  validate(config: ProviderConfig): ProviderValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (config.providerId !== CODEX_PROVIDER_ID) errors.push("providerId must be codex");
    if (config.providerType !== "Automation Provider") errors.push("Codex provider foundation uses the Automation Provider contract type.");
    if (!config.simulation) errors.push("Codex provider foundation supports simulation mode only");
    if (config.credentialsPlaceholder !== codexConfig.credentialsPlaceholder) {
      warnings.push("Credentials are placeholders only and are ignored in this foundation phase.");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      summary:
        errors.length === 0
          ? "Codex provider configuration is valid for deterministic simulation."
          : "Codex provider configuration is invalid for the offline foundation.",
    };
  },

  normalizeRequest(input: NormalizedRequest): NormalizedRequest {
    return {
      ...input,
      providerType: "Automation Provider",
      executionMode: "simulation",
      constraints: Array.from(
        new Set([
          ...input.constraints,
          "offline-only",
          "no-network",
          "no-shell-execution",
          "no-repository-mutation",
        ])
      ),
      metadata: {
        ...input.metadata,
        providerId: CODEX_PROVIDER_ID,
        simulation: "true",
      },
    };
  },

  normalizeResponse(input: NormalizedResponse): NormalizedResponse {
    return {
      ...input,
      status: "simulated",
      warnings: Array.from(
        new Set([
          ...input.warnings,
          "Codex provider foundation is simulation-only.",
        ])
      ),
    };
  },

  normalizeError(error: AdapterError): AdapterError {
    return {
      ...error,
      message: `${error.message} Codex provider foundation remains offline and deterministic.`,
    };
  },
};
