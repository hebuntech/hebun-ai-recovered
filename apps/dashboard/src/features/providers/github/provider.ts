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
  githubConfig,
  githubConfigSchema,
} from "@/features/providers/github/config";
import { githubProviderHealth } from "@/features/providers/github/health";
import {
  GITHUB_PROVIDER_FAMILY,
  GITHUB_PROVIDER_ID,
  GITHUB_PROVIDER_NAME,
} from "@/features/providers/github/types";

const supportedCapabilities: AdapterCapabilityKind[] = [
  "Repository",
  "File System",
  "Search",
  "Human Approval",
  "Simulation",
];

export const githubProvider: ProviderAdapter = {
  metadata: {
    id: GITHUB_PROVIDER_ID,
    name: `${GITHUB_PROVIDER_NAME} Provider`,
    version: "1.0.0",
    providerType: "Repository Provider",
    vendor: GITHUB_PROVIDER_FAMILY,
    description:
      "Offline GitHub provider foundation for repository, pull request, issue, workflow, governance, and release analysis scenarios. Simulation only, with no network, API integration, credentials, Git commands, or repository mutation.",
    simulation: true,
  },
  version: "1.0.0",
  providerType: "Repository Provider",
  supportedCapabilities,
  supportedExecutionModes: ["simulation"],
  configurationSchema: githubConfigSchema,
  simulationSupport: true,

  health(): ProviderHealth {
    return githubProviderHealth;
  },

  validate(config: ProviderConfig): ProviderValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (config.providerId !== GITHUB_PROVIDER_ID) {
      errors.push("providerId must be github");
    }
    if (config.providerType !== "Repository Provider") {
      errors.push(
        "GitHub provider foundation uses the Repository Provider contract type."
      );
    }
    if (!config.simulation) {
      errors.push("GitHub provider foundation supports simulation mode only");
    }
    if (config.credentialsPlaceholder !== githubConfig.credentialsPlaceholder) {
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
          ? "GitHub provider configuration is valid for deterministic simulation."
          : "GitHub provider configuration is invalid for the offline foundation.",
    };
  },

  normalizeRequest(input: NormalizedRequest): NormalizedRequest {
    return {
      ...input,
      providerType: "Repository Provider",
      executionMode: "simulation",
      constraints: Array.from(
        new Set([
          ...input.constraints,
          "offline-only",
          "no-network",
          "no-octokit",
          "no-git-commands",
          "no-repository-mutation",
        ])
      ),
      metadata: {
        ...input.metadata,
        providerId: GITHUB_PROVIDER_ID,
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
          "GitHub provider foundation is simulation-only.",
        ])
      ),
    };
  },

  normalizeError(error: AdapterError): AdapterError {
    return {
      ...error,
      message: `${error.message} GitHub provider foundation remains offline and deterministic.`,
    };
  },
};
