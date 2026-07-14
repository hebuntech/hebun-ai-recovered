import { registryDefinitions, registryDetailOrder } from "@/features/registries/definitions";
import { registryGrowthHistory } from "@/features/registries/growth";
import { registryOverviewMetrics } from "@/features/registries/metrics";
import { registryRecords } from "@/features/registries/records";
import { registryRelationships } from "@/features/registries/relationships";
import { registryTimeline } from "@/features/registries/timeline";
import type { RegistryDefinition, RegistryKey } from "@/features/registries/types";

export {
  registryDefinitions,
  registryDetailOrder,
  registryGrowthHistory,
  registryOverviewMetrics,
  registryRecords,
  registryRelationships,
  registryTimeline,
};

export * from "@/features/registries/intelligence";
export * from "@/features/registries/insights";
export * from "@/features/registries/risk-signals";
export * from "@/features/registries/recommendations";

export function registryById(id: RegistryKey): RegistryDefinition | undefined {
  return registryDefinitions.find((registry) => registry.id === id);
}
