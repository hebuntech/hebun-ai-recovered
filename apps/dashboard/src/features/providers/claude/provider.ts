import type { AdapterError, AdapterCapabilityKind } from "@/features/adapters";
import type {
  NormalizedRequest,
  NormalizedResponse,
  ProviderAdapter,
  ProviderConfig,
  ProviderHealth,
  ProviderValidationResult,
} from "@/features/provider-framework";
import { claudeConfigSchema, claudeConfig } from "@/features/providers/claude/config";
import { claudeProviderHealth } from "@/features/providers/claude/health";
import {
  CLAUDE_PROVIDER_FAMILY,
  CLAUDE_PROVIDER_ID,
  CLAUDE_PROVIDER_NAME,
} from "@/features/providers/claude/types";

const supportedCapabilities: AdapterCapabilityKind[] = [
  "Code Generation",
  "Search",
  "File System",
  "Terminal",
  "Human Approval",
  "Simulation",
];

export const claudeProvider: ProviderAdapter = {
  metadata: {
    id: CLAUDE_PROVIDER_ID,
    name: `${CLAUDE_PROVIDER_NAME} Provider`,
    version: "1.0.0",
    providerType: "LLM Provider",
    vendor: CLAUDE_PROVIDER_FAMILY,
    description:
      "Offline Claude provider foundation that defines provider contracts, capability mapping, health, telemetry, and deterministic simulation without any API, SDK, network access, or credentials.",
    simulation: true,
  },
  version: "1.0.0",
  providerType: "LLM Provider",
  supportedCapabilities,
  supportedExecutionModes: ["simulation"],
  configurationSchema: claudeConfigSchema,
  simulationSupport: true,

  health(): ProviderHealth {
    return claudeProviderHealth;
  },

  validate(config: ProviderConfig): ProviderValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (config.providerId !== CLAUDE_PROVIDER_ID) {
      errors.push("providerId must be claude");
    }
    if (config.providerType !== "LLM Provider") {
      errors.push("Claude provider must use the LLM Provider type");
    }
    if (!config.simulation) {
      errors.push("Claude provider foundation supports simulation mode only");
    }
    if (config.credentialsPlaceholder !== claudeConfig.credentialsPlaceholder) {
      warnings.push("Credentials are placeholders only and are ignored in this foundation phase.");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      summary:
        errors.length === 0
          ? "Claude provider configuration is valid for deterministic simulation."
          : "Claude provider configuration is invalid for the offline foundation.",
    };
  },

  normalizeRequest(input: NormalizedRequest): NormalizedRequest {
    return {
      ...input,
      providerType: "LLM Provider",
      executionMode: "simulation",
      constraints: Array.from(new Set([...input.constraints, "offline-only", "no-network"])),
      metadata: {
        ...input.metadata,
        providerId: CLAUDE_PROVIDER_ID,
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
          "Claude provider foundation is simulation-only.",
        ])
      ),
    };
  },

  normalizeError(error: AdapterError): AdapterError {
    return {
      ...error,
      message: `${error.message} Claude provider foundation remains offline and deterministic.`,
    };
  },
};
