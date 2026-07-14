import { inspectAdapter, type ContractAuditResult } from "@/features/adapters/adapter-inspector";
import { lifecycleDiagnostics, type LifecycleDiagnostics } from "@/features/adapters/adapter-lifecycle";
import { evaluateCircuit, type CircuitSnapshot } from "@/features/adapters/circuit-breaker";
import { registeredAdapterList } from "@/features/adapters/adapter-registry";
import type { AdapterLifecycleStage, ExecutionHealth, ExecutionTelemetry } from "@/features/adapters/types";

/*
 * adapter-diagnostics.ts — per-adapter diagnostic snapshot combining contract
 * audit, lifecycle diagnostics, health, telemetry and circuit state.
 */

export interface AdapterDiagnostics {
  adapterId: string;
  name: string;
  contract: ContractAuditResult;
  lifecycle: LifecycleDiagnostics;
  circuit: CircuitSnapshot;
  health: ExecutionHealth;
  telemetry: ExecutionTelemetry;
  healthy: boolean;
}

export function diagnoseAdapter(stage: AdapterLifecycleStage = "Ready"): AdapterDiagnostics[] {
  return registeredAdapterList().map((adapter) => {
    const contract = inspectAdapter(adapter);
    const health = adapter.health();
    return {
      adapterId: adapter.metadata.id,
      name: adapter.metadata.name,
      contract,
      lifecycle: lifecycleDiagnostics(stage),
      circuit: evaluateCircuit(0),
      health,
      telemetry: adapter.telemetry(),
      healthy: contract.complete && health.status === "Healthy",
    };
  });
}

export const adapterDiagnostics = diagnoseAdapter();
