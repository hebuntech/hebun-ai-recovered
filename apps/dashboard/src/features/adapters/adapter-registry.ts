import { simulationAdapter } from "@/features/adapters/adapter-simulation";
import { toAdapterRecord } from "@/features/adapters/adapter-factory";
import type { AdapterRecord, ExecutionAdapter } from "@/features/adapters/types";

/*
 * Adapter Registry — the single catalog of adapters plugged into the SDK.
 *
 * Only the built-in Simulation Adapter is registered. Future phases register
 * real providers (Claude Code, Codex, Browser, LLM Gateway) — each implements
 * the ExecutionAdapter contract; the registry stays provider-independent.
 */

const registeredAdapters: ExecutionAdapter[] = [simulationAdapter];

export const adapterRecords: AdapterRecord[] = registeredAdapters.map((adapter) =>
  toAdapterRecord(adapter, "Ready", "09:01")
);

export function registeredAdapterList(): ExecutionAdapter[] {
  return registeredAdapters;
}

export function adapterRecordById(id: string): AdapterRecord | undefined {
  return adapterRecords.find((r) => r.metadata.id === id);
}

export function adapterById(id: string): ExecutionAdapter | undefined {
  return registeredAdapters.find((a) => a.metadata.id === id);
}
