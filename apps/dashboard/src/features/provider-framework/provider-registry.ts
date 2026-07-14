import { referenceProvider } from "@/features/provider-framework/provider-contract";
import { toProviderRecord } from "@/features/provider-framework/provider-factory";
import type { ProviderAdapter, ProviderRecord } from "@/features/provider-framework/types";

/*
 * provider-registry.ts — catalog of provider adapters implementing the
 * framework. Only the deterministic Reference Simulation Provider is present;
 * real providers register in later phases without framework changes.
 */
const registeredProviders: ProviderAdapter[] = [referenceProvider];

export const providerRecords: ProviderRecord[] = registeredProviders.map((p) =>
  toProviderRecord(p, "09:01")
);

export function registeredProviderList(): ProviderAdapter[] {
  return registeredProviders;
}

export function providerById(id: string): ProviderAdapter | undefined {
  return registeredProviders.find((p) => p.metadata.id === id);
}

export function providerRecordById(id: string): ProviderRecord | undefined {
  return providerRecords.find((r) => r.metadata.id === id);
}
