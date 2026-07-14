import { providerRecords } from "@/features/provider-framework/provider-registry";
import { providerTypeDefinitions } from "@/features/provider-framework/provider-metadata";
import { simulationProfiles } from "@/features/provider-framework/provider-simulation";
import { FRAMEWORK_VERSION, type FrameworkMetrics } from "@/features/provider-framework/types";
import type { BadgeVariant } from "@/components/ui/badge";

const registeredProviderTypes = providerTypeDefinitions.length;
const registeredProviders = providerRecords.length;
const conformanceScore = registeredProviders
  ? Math.round(providerRecords.reduce((sum, r) => sum + r.conformanceScore, 0) / registeredProviders)
  : 100;
const simulationCoverage = Math.round(
  (simulationProfiles.filter((p) => p.deterministic).length / Math.max(providerTypeDefinitions.length, 1)) * 100
);
const healthyProviders = providerRecords.filter((r) => r.health.status === "Healthy").length;
const frameworkHealth = registeredProviders
  ? Math.round((healthyProviders / registeredProviders) * 100)
  : 100;

const healthBadge: BadgeVariant =
  conformanceScore >= 90 && frameworkHealth >= 90 ? "success" : conformanceScore >= 75 ? "warning" : "error";

export const frameworkMetrics: FrameworkMetrics = {
  frameworkVersion: FRAMEWORK_VERSION,
  registeredProviderTypes,
  registeredProviders,
  frameworkHealth,
  simulationCoverage,
  conformanceScore,
  healthBadge,
};
