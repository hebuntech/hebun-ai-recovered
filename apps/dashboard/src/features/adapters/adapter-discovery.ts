import { adapterRecords } from "@/features/adapters/adapter-registry";
import type { AdapterCapabilityKind, AdapterRecord } from "@/features/adapters/types";

/*
 * Adapter discovery — find registered adapters by capability or health.
 * Powers capability matching for the Orchestration/Planning layers, which
 * ask "which adapter can do X" without knowing any provider details.
 */
export function discoverByCapability(kind: AdapterCapabilityKind): AdapterRecord[] {
  return adapterRecords.filter((r) => r.capabilities.some((c) => c.kind === kind));
}

export function discoverHealthy(): AdapterRecord[] {
  return adapterRecords.filter((r) => r.health.status === "Healthy");
}

export function discoverSimulationCapable(): AdapterRecord[] {
  return adapterRecords.filter((r) => r.metadata.simulation);
}

/** capability → adapter ids map for discovery UIs */
export function capabilityCoverage(): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const record of adapterRecords) {
    for (const cap of record.capabilities) {
      (map[cap.kind] ??= []).push(record.metadata.id);
    }
  }
  return map;
}
