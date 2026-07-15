import type { BadgeVariant } from "@/components/ui/badge";
import { MATRIX_CAPABILITIES } from "@/features/provider-matrix/capability-matrix";
import { capabilityGaps, futureProviders } from "@/features/provider-matrix/provider-gaps";
import { providerCatalog } from "@/features/provider-matrix/provider-catalog";
import type { NetworkHealth } from "@/features/provider-matrix/types";

const providerCount = providerCatalog.length;
const healthyProviders = providerCatalog.filter(
  (provider) => provider.health.status === "Healthy"
).length;
const simulationProviders = providerCatalog.filter(
  (provider) => provider.simulationSupport
).length;
const coveredCapabilities = capabilityGaps.filter(
  (gap) => gap.status !== "missing"
).length;
const totalCapabilities = MATRIX_CAPABILITIES.length;
const simulationCoverage = Math.round(
  (simulationProviders / Math.max(providerCount, 1)) * 100
);
const capabilityCoverage = Math.round(
  (coveredCapabilities / Math.max(totalCapabilities, 1)) * 100
);
const providerHealth = Math.round(
  (healthyProviders / Math.max(providerCount, 1)) * 100
);
const overallHealth = Math.round(
  (providerHealth + simulationCoverage + capabilityCoverage) / 3
);
const badge: BadgeVariant =
  overallHealth >= 90 ? "success" : overallHealth >= 70 ? "warning" : "error";

export const networkHealth: NetworkHealth = {
  overallHealth,
  simulationCoverage,
  capabilityCoverage,
  coveredCapabilities,
  totalCapabilities,
  missingProviders: futureProviders.length,
  healthyProviders,
  providerCount,
  badge,
};
