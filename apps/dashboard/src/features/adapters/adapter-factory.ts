import type { AdapterLifecycleStage, AdapterRecord, ExecutionAdapter } from "@/features/adapters/types";

/*
 * Adapter factory — builds a registry record from an ExecutionAdapter
 * implementation. Pure + deterministic; no instantiation side effects.
 */
export function toAdapterRecord(
  adapter: ExecutionAdapter,
  lifecycle: AdapterLifecycleStage,
  registeredAt: string
): AdapterRecord {
  return {
    metadata: adapter.metadata,
    capabilities: adapter.capabilities,
    lifecycle,
    health: adapter.health(),
    telemetry: adapter.telemetry(),
    registeredAt,
  };
}
