import { providerRecords } from "@/features/provider-framework/provider-registry";
import { providerTypeDefinitions } from "@/features/provider-framework/provider-metadata";
import type { ProviderTypeKind } from "@/features/provider-framework/types";

export function allProviderRecords() {
  return providerRecords;
}

export function coveredProviderTypes(): ProviderTypeKind[] {
  return [...new Set(providerRecords.map((r) => r.providerType))];
}

export function uncoveredProviderTypes(): ProviderTypeKind[] {
  const covered = new Set(coveredProviderTypes());
  return providerTypeDefinitions.filter((p) => !covered.has(p.type)).map((p) => p.type);
}
