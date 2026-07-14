import { makeAdapterError } from "@/features/adapters";
import type { ExecutionTelemetry } from "@/features/adapters";
import { buildNormalizedRequest } from "@/features/provider-framework/provider-request";
import { buildNormalizedResponse } from "@/features/provider-framework/provider-response";
import { providerTypeDefinitions } from "@/features/provider-framework/provider-metadata";
import type { ProviderSimulationProfile, ProviderTypeKind } from "@/features/provider-framework/types";

/*
 * provider-simulation.ts — deterministic simulation profiles for every
 * provider type. No external communication; fixed sample request/response/
 * failure so pipelines and conformance can run before any real provider.
 */

const simTelemetry: ExecutionTelemetry = {
  executions: 12,
  succeeded: 12,
  failed: 0,
  cancelled: 0,
  averageDurationMs: 40,
  lastUpdated: "09:05",
  successRate: 100,
  failureRate: 0,
  peakDurationMs: 55,
  queueTimeMs: 6,
  retryCount: 0,
  rollbackCount: 0,
  cancelCount: 0,
};

export function simulationProfileFor(kind: ProviderTypeKind): ProviderSimulationProfile {
  const def = providerTypeDefinitions.find((p) => p.type === kind);
  const capabilities = def?.defaultCapabilities ?? [];
  const requestId = `sim-${kind.replace(/\s+/g, "-").toLowerCase()}`;

  const sampleRequest = buildNormalizedRequest({
    requestId,
    providerType: kind,
    executionMode: "simulation",
    payloadSummary: `Simulated ${kind} request`,
    capabilities,
    constraints: ["deterministic", "no-side-effects"],
    metadata: { simulation: "true" },
  });

  const sampleResponse = buildNormalizedResponse({
    requestId,
    status: "simulated",
    resultSummary: `Simulated ${kind} response (no external calls)`,
    metrics: { steps: 3, durationMs: 40, retryCount: 0 },
    telemetry: simTelemetry,
    warnings: [],
    events: [],
  });

  const sampleFailure = makeAdapterError("CAPABILITY_UNSUPPORTED", `Simulated ${kind} failure sample`, {
    adapterId: requestId,
  });

  return { providerType: kind, deterministic: true, sampleRequest, sampleResponse, sampleFailure };
}

export const simulationProfiles: ProviderSimulationProfile[] = providerTypeDefinitions.map((p) =>
  simulationProfileFor(p.type)
);
