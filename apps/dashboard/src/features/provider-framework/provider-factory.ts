import { runConformance } from "@/features/provider-framework/provider-conformance";
import type { ProviderAdapter, ProviderRecord } from "@/features/provider-framework/types";

/*
 * provider-factory.ts — builds a registry record from a ProviderAdapter.
 * Pure + deterministic; conformance score computed at build time.
 */
export function toProviderRecord(provider: ProviderAdapter, registeredAt: string): ProviderRecord {
  return {
    metadata: provider.metadata,
    providerType: provider.providerType,
    capabilities: provider.supportedCapabilities,
    executionModes: provider.supportedExecutionModes,
    health: provider.health(),
    conformanceScore: runConformance(provider).score,
    simulationSupport: provider.simulationSupport,
    registeredAt,
  };
}
