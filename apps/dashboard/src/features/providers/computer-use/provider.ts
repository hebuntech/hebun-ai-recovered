import type { AdapterCapabilityKind, AdapterError } from "@/features/adapters";
import type {
  NormalizedRequest,
  NormalizedResponse,
  ProviderAdapter,
  ProviderConfig,
  ProviderHealth,
  ProviderValidationResult,
} from "@/features/provider-framework";
import {
  computerUseConfig,
  computerUseConfigSchema,
} from "@/features/providers/computer-use/config";
import { computerUseProviderHealth } from "@/features/providers/computer-use/health";
import {
  COMPUTER_USE_PROVIDER_FAMILY,
  COMPUTER_USE_PROVIDER_ID,
  COMPUTER_USE_PROVIDER_NAME,
} from "@/features/providers/computer-use/types";

const supportedCapabilities: AdapterCapabilityKind[] = [
  "Terminal",
  "File System",
  "Search",
  "Human Approval",
  "Simulation",
];

export const computerUseProvider: ProviderAdapter = {
  metadata: {
    id: COMPUTER_USE_PROVIDER_ID,
    name: `${COMPUTER_USE_PROVIDER_NAME} Provider`,
    version: "1.0.0",
    providerType: "Computer Use Provider",
    vendor: COMPUTER_USE_PROVIDER_FAMILY,
    description:
      "Offline Computer Use provider foundation for desktop inspection, application workflow planning, interaction planning, and session safety scenarios. Simulation only, with no OS control, no tool execution, no screenshots, and no network access.",
    simulation: true,
  },
  version: "1.0.0",
  providerType: "Computer Use Provider",
  supportedCapabilities,
  supportedExecutionModes: ["simulation"],
  configurationSchema: computerUseConfigSchema,
  simulationSupport: true,

  health(): ProviderHealth {
    return computerUseProviderHealth;
  },

  validate(config: ProviderConfig): ProviderValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (config.providerId !== COMPUTER_USE_PROVIDER_ID) {
      errors.push("providerId must be computer-use");
    }
    if (config.providerType !== "Computer Use Provider") {
      errors.push(
        "Computer Use provider foundation uses the Computer Use Provider contract type."
      );
    }
    if (!config.simulation) {
      errors.push("Computer Use provider foundation supports simulation mode only");
    }
    if (config.credentialsPlaceholder !== computerUseConfig.credentialsPlaceholder) {
      warnings.push(
        "Credentials are placeholders only and are ignored in this foundation phase."
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      summary:
        errors.length === 0
          ? "Computer Use provider configuration is valid for deterministic simulation."
          : "Computer Use provider configuration is invalid for the offline foundation.",
    };
  },

  normalizeRequest(input: NormalizedRequest): NormalizedRequest {
    return {
      ...input,
      providerType: "Computer Use Provider",
      executionMode: "simulation",
      constraints: Array.from(
        new Set([
          ...input.constraints,
          "offline-only",
          "no-os-control",
          "no-keyboard-input",
          "no-mouse-input",
          "no-tool-execution",
        ])
      ),
      metadata: {
        ...input.metadata,
        providerId: COMPUTER_USE_PROVIDER_ID,
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
          "Computer Use provider foundation is simulation-only.",
        ])
      ),
    };
  },

  normalizeError(error: AdapterError): AdapterError {
    return {
      ...error,
      message: `${error.message} Computer Use provider foundation remains offline and deterministic.`,
    };
  },
};
