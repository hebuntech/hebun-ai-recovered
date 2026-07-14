import { runConformance } from "@/features/provider-framework/provider-conformance";
import { simulationProfileFor } from "@/features/provider-framework/provider-simulation";
import type { ProviderAdapter } from "@/features/provider-framework/types";

/*
 * provider-test-harness.ts — reusable deterministic harness that exercises a
 * ProviderAdapter in simulation and validates every contract surface.
 */
export interface HarnessStep {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface HarnessResult {
  providerId: string;
  steps: HarnessStep[];
  passed: number;
  total: number;
  ok: boolean;
}

export function runTestHarness(provider: ProviderAdapter): HarnessResult {
  const profile = simulationProfileFor(provider.providerType);
  const conformance = runConformance(provider);
  const response = provider.normalizeResponse(profile.sampleResponse);
  const health = provider.health();

  const steps: HarnessStep[] = [
    { id: "simulate", label: "Simulation execution", passed: response.status === "simulated", detail: response.resultSummary },
    { id: "contract", label: "Contract validation", passed: conformance.verdict !== "fail", detail: `${conformance.passed}/${conformance.total} checks` },
    { id: "response", label: "Response validation", passed: response.requestId === profile.sampleRequest.requestId, detail: "normalized response valid" },
    { id: "error", label: "Error validation", passed: provider.normalizeError(profile.sampleFailure).code === profile.sampleFailure.code, detail: "error mapped to SDK code" },
    { id: "health", label: "Health validation", passed: health.availability >= 0, detail: `${health.status} · ${health.availability}%` },
  ];

  const passed = steps.filter((s) => s.passed).length;
  return { providerId: provider.metadata.id, steps, passed, total: steps.length, ok: passed === steps.length };
}
