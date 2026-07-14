import { providerRecords } from "@/features/provider-framework/provider-registry";
import type { AdapterCapabilityKind } from "@/features/adapters";
import type { ProviderRecord, ProviderTypeKind } from "@/features/provider-framework/types";

/*
 * provider-discovery.ts — find registered providers by type, capability or
 * health. Orchestration/Planning use this to choose a provider without
 * knowing any provider internals.
 */
export function discoverByType(type: ProviderTypeKind): ProviderRecord[] {
  return providerRecords.filter((r) => r.providerType === type);
}

export function discoverByCapability(capability: AdapterCapabilityKind): ProviderRecord[] {
  return providerRecords.filter((r) => r.capabilities.includes(capability));
}

export function discoverHealthy(): ProviderRecord[] {
  return providerRecords.filter((r) => r.health.status === "Healthy");
}

export function discoverSimulationCapable(): ProviderRecord[] {
  return providerRecords.filter((r) => r.simulationSupport);
}
