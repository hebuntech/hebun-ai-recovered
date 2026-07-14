import { adapterRecords } from "@/features/adapters/adapter-registry";
import { capabilityCatalog } from "@/features/adapters/adapter-capabilities";
import type { AdapterHealthStatus } from "@/features/adapters/types";

export function allAdapterRecords() {
  return adapterRecords;
}

export function adaptersByHealth(status: AdapterHealthStatus) {
  return adapterRecords.filter((r) => r.health.status === status);
}

export function coveredCapabilityKinds(): string[] {
  const kinds = new Set<string>();
  for (const record of adapterRecords) {
    for (const cap of record.capabilities) kinds.add(cap.kind);
  }
  return [...kinds];
}

export function uncoveredCapabilities() {
  const covered = new Set(coveredCapabilityKinds());
  return capabilityCatalog.filter((c) => !covered.has(c.kind));
}
