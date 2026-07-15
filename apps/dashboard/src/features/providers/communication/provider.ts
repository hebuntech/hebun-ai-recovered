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
  communicationConfig,
  communicationConfigSchema,
} from "@/features/providers/communication/config";
import { communicationProviderHealth } from "@/features/providers/communication/health";
import {
  COMMUNICATION_PROVIDER_FAMILY,
  COMMUNICATION_PROVIDER_ID,
  COMMUNICATION_PROVIDER_NAME,
} from "@/features/providers/communication/types";

const supportedCapabilities: AdapterCapabilityKind[] = [
  "Email",
  "Calendar",
  "Messaging",
  "Search",
  "Human Approval",
  "Simulation",
];

export const communicationProvider: ProviderAdapter = {
  metadata: {
    id: COMMUNICATION_PROVIDER_ID,
    name: `${COMMUNICATION_PROVIDER_NAME} Provider`,
    version: "1.0.0",
    providerType: "Communication Provider",
    vendor: COMMUNICATION_PROVIDER_FAMILY,
    description:
      "Offline communication planning for email, calendar, meetings, messaging, and notifications. No delivery, scheduling, OAuth, credentials, or network access.",
    simulation: true,
  },
  version: "1.0.0",
  providerType: "Communication Provider",
  supportedCapabilities,
  supportedExecutionModes: ["simulation"],
  configurationSchema: communicationConfigSchema,
  simulationSupport: true,
  health(): ProviderHealth {
    return communicationProviderHealth;
  },
  validate(config: ProviderConfig): ProviderValidationResult {
    const errors: string[] = [];
    if (config.providerId !== COMMUNICATION_PROVIDER_ID) errors.push("providerId must be communication");
    if (config.providerType !== "Communication Provider") errors.push("providerType must be Communication Provider");
    if (!config.simulation) errors.push("Communication provider supports simulation only");
    return {
      valid: errors.length === 0,
      errors,
      warnings:
        config.credentialsPlaceholder === communicationConfig.credentialsPlaceholder
          ? []
          : ["Credentials are ignored; this provider is offline only."],
      summary: errors.length === 0 ? "Configuration valid for simulation." : "Configuration invalid.",
    };
  },
  normalizeRequest(input: NormalizedRequest): NormalizedRequest {
    return {
      ...input,
      providerType: "Communication Provider",
      executionMode: "simulation",
      constraints: Array.from(new Set([...input.constraints, "offline-only", "no-network", "no-real-delivery"])),
      metadata: { ...input.metadata, providerId: COMMUNICATION_PROVIDER_ID, simulation: "true" },
    };
  },
  normalizeResponse(input: NormalizedResponse): NormalizedResponse {
    return {
      ...input,
      status: "simulated",
      warnings: Array.from(new Set([...input.warnings, "Communication output is simulation-only."])),
    };
  },
  normalizeError(error: AdapterError): AdapterError {
    return { ...error, message: `${error.message} Communication provider remains offline.` };
  },
};
