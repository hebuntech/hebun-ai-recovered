/*
 * runtime-health.ts — deterministic runtime health. Blends provider health,
 * conformance, simulation coverage and readiness into a single 0–100 score.
 */

import { getCatalogEntry, networkHealth } from "@/features/provider-matrix";
import type { RuntimeContext } from "@/features/runtime-boundary/runtime-context";
import type { ReadinessAssessment, RuntimeHealthAssessment } from "@/features/runtime-boundary/types";

const statusScore: Record<string, number> = { Healthy: 100, Degraded: 60, Unavailable: 10, Unknown: 30 };

export function assessRuntimeHealth(
  context: RuntimeContext,
  readiness: ReadinessAssessment
): RuntimeHealthAssessment {
  const entry = context.providerId ? getCatalogEntry(context.providerId) : undefined;
  const availability = entry?.health.availability ?? 0;
  const latencyMs = entry?.health.latencyMs ?? 0;
  const reliability = entry?.conformanceScore ?? 0;
  const base = statusScore[entry?.health.status ?? "Unknown"] ?? 30;
  const providerReadiness = readiness.score;
  const runtimeReadiness = readiness.ready ? 80 : 40; // capped: live runtime not enabled

  const score = Math.round(
    base * 0.35 + availability * 0.15 + reliability * 0.2 + providerReadiness * 0.15 + runtimeReadiness * 0.15
  );

  return {
    availability,
    latencyMs,
    reliability,
    simulationCoverage: networkHealth.simulationCoverage,
    providerReadiness,
    runtimeReadiness,
    score,
    healthy: score >= 60,
  };
}
