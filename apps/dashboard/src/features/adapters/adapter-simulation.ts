import { capabilityCatalog } from "@/features/adapters/adapter-capabilities";
import { aggregateTelemetry } from "@/features/adapters/adapter-telemetry";
import { deriveHealth } from "@/features/adapters/adapter-health";
import type {
  AdapterCapabilityKind,
  AdapterLifecycleStage,
  AdapterMetadata,
  AdapterValidationResult,
  ExecutionAdapter,
  ExecutionHealth,
  ExecutionRequest,
  ExecutionResponse,
  ExecutionResult,
  ExecutionTelemetry,
} from "@/features/adapters/types";

/*
 * Simulation Adapter — the only built-in adapter.
 *
 * Never accesses external systems. Never executes real work. Returns
 * deterministic mock execution so pipelines can be validated end-to-end
 * before any real provider adapter exists.
 */

export const simulationMetadata: AdapterMetadata = {
  id: "simulation",
  name: "Simulation Adapter",
  version: "1.0.0",
  vendor: "Hebun AI",
  description:
    "Deterministic, side-effect-free adapter used to validate the execution pipeline. Simulates every capability without touching external systems.",
  category: "Simulation",
  deterministic: true,
  simulation: true,
};

/* Deterministic simulated results — one per capability, fixed values. */
const simulatedResults: ExecutionResult[] = capabilityCatalog.map((cap, i) => ({
  id: `sim-res-${i + 1}`,
  requestId: `sim-req-${i + 1}`,
  adapterId: "simulation",
  outcome: "simulated",
  outputSummary: `Simulated ${cap.kind} execution (no side effects)`,
  steps: 3,
  durationMs: 40,
  deterministic: true,
}));

export const simulationTelemetry: ExecutionTelemetry = {
  ...aggregateTelemetry(simulatedResults, "09:05"),
  successRate: 100,
  failureRate: 0,
  peakDurationMs: 52,
  queueTimeMs: 8,
  retryCount: 0,
  rollbackCount: 0,
  cancelCount: 0,
};

export const simulationHealth: ExecutionHealth = {
  ...deriveHealth(100, 40, "09:01"),
  availability: 100,
  reliability: 99,
  errorRate: 0,
  resourceUsage: 12,
  lastSuccessfulExecution: "09:05",
  lastFailedExecution: "—",
};

export const simulationAdapter: ExecutionAdapter = {
  metadata: simulationMetadata,
  // simulation adapter can simulate every capability
  capabilities: capabilityCatalog,

  supports(capability: AdapterCapabilityKind): boolean {
    return this.capabilities.some((c) => c.kind === capability);
  },

  initialize(): AdapterLifecycleStage {
    return "Ready";
  },

  validate(request: ExecutionRequest): AdapterValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    if (!this.supports(request.capability)) {
      errors.push(`Capability not supported: ${request.capability}`);
    }
    if (!request.deterministic) {
      warnings.push("Request is not marked deterministic; simulation forces determinism.");
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      summary: errors.length === 0 ? "Request valid for simulation" : "Request rejected",
    };
  },

  prepare(request: ExecutionRequest): ExecutionResponse {
    return {
      accepted: this.supports(request.capability),
      reason: this.supports(request.capability)
        ? "Prepared deterministic simulation"
        : "Capability unavailable",
      estimatedSteps: 3,
    };
  },

  execute(request: ExecutionRequest): ExecutionResult {
    return {
      id: `sim-run-${request.id}`,
      requestId: request.id,
      adapterId: "simulation",
      outcome: "simulated",
      outputSummary: `Simulated ${request.capability}: ${request.action} (no side effects)`,
      steps: 3,
      durationMs: 40,
      deterministic: true,
    };
  },

  pause(): AdapterLifecycleStage {
    return "Paused";
  },
  resume(): AdapterLifecycleStage {
    return "Executing";
  },
  cancel(): AdapterLifecycleStage {
    return "Cancelled";
  },
  rollback(): AdapterLifecycleStage {
    return "Ready";
  },
  shutdown(): AdapterLifecycleStage {
    return "Unloaded";
  },
  health(): ExecutionHealth {
    return simulationHealth;
  },
  telemetry(): ExecutionTelemetry {
    return simulationTelemetry;
  },
};
