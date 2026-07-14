/*
 * health-filter.ts — deterministic health evaluation over matrix catalog data.
 * Produces a health assessment and a 0–100 health score per provider. No live
 * probing — reads the provider's declared offline health snapshot.
 */

import { getCatalogEntry } from "@/features/provider-matrix";
import type { ProviderId } from "@/features/provider-matrix";
import type { HealthAssessment } from "@/features/provider-routing/types";

const statusScore: Record<string, number> = {
  Healthy: 100,
  Degraded: 60,
  Unavailable: 10,
  Unknown: 30,
};

export function assessHealth(providerId: ProviderId): HealthAssessment {
  const entry = getCatalogEntry(providerId);
  const health = entry?.health;
  const status = health?.status ?? "Unknown";
  return {
    providerId,
    status,
    availability: health?.availability ?? 0,
    latencyMs: health?.latencyMs ?? 0,
    reliability: entry?.conformanceScore ?? 0,
    simulationReady: entry?.simulationSupport ?? false,
    healthy: status === "Healthy" || status === "Degraded",
  };
}

/** 0–100 health score blending status, availability and reliability. */
export function healthScore(providerId: ProviderId): number {
  const a = assessHealth(providerId);
  const base = statusScore[a.status] ?? 30;
  return Math.round(base * 0.6 + a.availability * 0.2 + a.reliability * 0.2);
}
