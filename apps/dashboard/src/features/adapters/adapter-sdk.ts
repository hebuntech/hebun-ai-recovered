import { simulationAdapter } from "@/features/adapters/adapter-simulation";
import { validateAdapter } from "@/features/adapters/adapter-validator";
import { makeEvent } from "@/features/adapters/adapter-events";
import type {
  AdapterContext,
  ExecutionAdapter,
  ExecutionEnvironment,
  ExecutionRequest,
  ExecutionSession,
} from "@/features/adapters/types";

/*
 * Execution Adapter SDK facade.
 *
 * The single surface the Execution Engine, Orchestration and Planning use.
 * They never touch a provider directly — they go through this SDK, which
 * validates the contract and (for now) routes everything to the deterministic
 * Simulation Adapter.
 */

export const simulationEnvironment: ExecutionEnvironment = {
  id: "env-simulation",
  mode: "simulation",
  deterministic: true,
  isolated: true,
  note: "No external systems. Deterministic mock execution only.",
};

/** Confirm an adapter satisfies the SDK contract before registration. */
export function registerAdapter(adapter: ExecutionAdapter) {
  const validation = validateAdapter(adapter);
  return { accepted: validation.valid, validation };
}

/** Build a deterministic simulation context. */
export function simulationContext(requestedBy: string): AdapterContext {
  return {
    sessionId: "adapter-sim-session",
    environment: simulationEnvironment,
    capabilities: simulationAdapter.capabilities.map((c) => c.kind),
    requestedBy,
    deterministic: true,
  };
}

/*
 * Run a request through the SDK against the Simulation Adapter. Fully
 * deterministic: validate → prepare → execute, emitting contract events.
 */
export function runSimulation(request: ExecutionRequest): ExecutionSession {
  const context = simulationContext("Execution Engine");
  const validation = simulationAdapter.validate(request);
  const result = validation.valid
    ? simulationAdapter.execute(request, context)
    : undefined;

  return {
    id: `adapter-session-${request.id}`,
    adapterId: simulationAdapter.metadata.id,
    stage: validation.valid ? "Completed" : "Failed",
    startedAt: "09:04",
    request,
    result,
    events: [
      makeEvent("Execution Started", "simulation", `Started ${request.capability}`, "09:04"),
      makeEvent("Execution Progress", "simulation", "Step 2/3 simulated", "09:04"),
      makeEvent(
        validation.valid ? "Execution Completed" : "Execution Failed",
        "simulation",
        validation.valid ? "Completed deterministically" : validation.summary,
        "09:05"
      ),
    ],
  };
}

/* A ready-made deterministic sample session for UI display. */
export const sampleSimulationSession: ExecutionSession = runSimulation({
  id: "req-sample",
  capability: "File System",
  action: "write workspace/report.md",
  payloadSummary: "Deterministic sample file write",
  dryRun: true,
  deterministic: true,
});
