import { registryDefinitions } from "@/features/registries/definitions";
import type { RegistryOverviewMetrics } from "@/features/registries/types";

export const registryOverviewMetrics: RegistryOverviewMetrics = {
  totalRegistries: registryDefinitions.length,
  registryHealth: Math.round(
    registryDefinitions.reduce((sum, registry) => sum + registry.health, 0) /
      registryDefinitions.length
  ),
  totalRecords: registryDefinitions.reduce(
    (sum, registry) => sum + registry.totalRecords,
    0
  ),
  dailyGrowth: registryDefinitions.reduce(
    (sum, registry) => sum + registry.dailyGrowth,
    0
  ),
  activeRecords: registryDefinitions.reduce(
    (sum, registry) => sum + registry.activeRecords,
    0
  ),
  archivedRecords: registryDefinitions.reduce(
    (sum, registry) => sum + registry.archivedRecords,
    0
  ),
  synchronization: Math.round(
    registryDefinitions.reduce(
      (sum, registry) => sum + registry.synchronization,
      0
    ) / registryDefinitions.length
  ),
  recentChanges: registryDefinitions.reduce(
    (sum, registry) => sum + registry.recentChanges,
    0
  ),
};
