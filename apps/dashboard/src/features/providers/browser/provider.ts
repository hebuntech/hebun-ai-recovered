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
  browserConfig,
  browserConfigSchema,
} from "@/features/providers/browser/config";
import { browserProviderHealth } from "@/features/providers/browser/health";
import {
  BROWSER_PROVIDER_FAMILY,
  BROWSER_PROVIDER_ID,
  BROWSER_PROVIDER_NAME,
} from "@/features/providers/browser/types";

const supportedCapabilities: AdapterCapabilityKind[] = [
  "Browser",
  "Search",
  "File System",
  "Human Approval",
  "Simulation",
];

export const browserProvider: ProviderAdapter = {
  metadata: {
    id: BROWSER_PROVIDER_ID,
    name: `${BROWSER_PROVIDER_NAME} Provider`,
    version: "1.0.0",
    providerType: "Browser Provider",
    vendor: BROWSER_PROVIDER_FAMILY,
    description:
      "Offline Browser provider foundation for page navigation, DOM analysis, extraction planning, accessibility inspection, and browser workflow scenarios. Simulation only, with no browser process, no web automation, no JavaScript execution, and no network access.",
    simulation: true,
  },
  version: "1.0.0",
  providerType: "Browser Provider",
  supportedCapabilities,
  supportedExecutionModes: ["simulation"],
  configurationSchema: browserConfigSchema,
  simulationSupport: true,

  health(): ProviderHealth {
    return browserProviderHealth;
  },

  validate(config: ProviderConfig): ProviderValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (config.providerId !== BROWSER_PROVIDER_ID) {
      errors.push("providerId must be browser");
    }
    if (config.providerType !== "Browser Provider") {
      errors.push(
        "Browser provider foundation uses the Browser Provider contract type."
      );
    }
    if (!config.simulation) {
      errors.push("Browser provider foundation supports simulation mode only");
    }
    if (config.credentialsPlaceholder !== browserConfig.credentialsPlaceholder) {
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
          ? "Browser provider configuration is valid for deterministic simulation."
          : "Browser provider configuration is invalid for the offline foundation.",
    };
  },

  normalizeRequest(input: NormalizedRequest): NormalizedRequest {
    return {
      ...input,
      providerType: "Browser Provider",
      executionMode: "simulation",
      constraints: Array.from(
        new Set([
          ...input.constraints,
          "offline-only",
          "no-network",
          "no-browser-process",
          "no-javascript-execution",
          "no-web-automation",
        ])
      ),
      metadata: {
        ...input.metadata,
        providerId: BROWSER_PROVIDER_ID,
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
          "Browser provider foundation is simulation-only.",
        ])
      ),
    };
  },

  normalizeError(error: AdapterError): AdapterError {
    return {
      ...error,
      message: `${error.message} Browser provider foundation remains offline and deterministic.`,
    };
  },
};
