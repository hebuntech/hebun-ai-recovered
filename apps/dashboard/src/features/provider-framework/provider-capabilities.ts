import { providerTypeDefinitions } from "@/features/provider-framework/provider-metadata";
import type { AdapterCapabilityKind } from "@/features/adapters";
import type { ProviderTypeKind } from "@/features/provider-framework/types";

/*
 * provider-capabilities.ts — maps provider types ↔ SDK capabilities.
 * Lets Orchestration/Planning ask "which provider type covers capability X".
 */

export function capabilitiesForProviderType(kind: ProviderTypeKind): AdapterCapabilityKind[] {
  return providerTypeDefinitions.find((p) => p.type === kind)?.defaultCapabilities ?? [];
}

export function providerTypesForCapability(capability: AdapterCapabilityKind): ProviderTypeKind[] {
  return providerTypeDefinitions
    .filter((p) => p.defaultCapabilities.includes(capability))
    .map((p) => p.type);
}

/** capability → provider-type coverage map */
export function capabilityMapping(): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const def of providerTypeDefinitions) {
    for (const cap of def.defaultCapabilities) {
      (map[cap] ??= []).push(def.type);
    }
  }
  return map;
}
