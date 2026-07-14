/*
 * provider-score.ts — deterministic provider scoring across six dimensions.
 * All dimensions are normalized to 0–100; total is their rounded average.
 */

import type { BadgeVariant } from "@/components/ui/badge";
import {
  capabilitiesBySupport,
  MATRIX_CAPABILITIES,
  PROVIDER_NAMES,
  PROVIDER_ORDER,
} from "@/features/provider-matrix/capability-matrix";
import { getCatalogEntry } from "@/features/provider-matrix/provider-catalog";
import { providerPriorities } from "@/features/provider-matrix/provider-priority";
import type { ProviderId, ProviderScore } from "@/features/provider-matrix/types";

function scoreBadge(total: number): BadgeVariant {
  return total >= 80 ? "success" : total >= 60 ? "warning" : "error";
}

function healthScore(id: ProviderId): number {
  const entry = getCatalogEntry(id);
  if (!entry) return 0;
  return entry.health.status === "Healthy" ? 100 : entry.health.status === "Degraded" ? 60 : 20;
}

export const providerScores: ProviderScore[] = PROVIDER_ORDER.map((id) => {
  const entry = getCatalogEntry(id);
  const primary = capabilitiesBySupport(id, "primary").length;
  const secondary = capabilitiesBySupport(id, "secondary").length;
  const total = MATRIX_CAPABILITIES.length;

  const coverage = Math.round(((primary + secondary) / total) * 100);
  const capabilityBreadth = Math.round(((primary * 2 + secondary) / (total * 2)) * 100);
  const simulationReadiness = entry?.simulationSupport ? 100 : 0;
  const rank = providerPriorities.find((p) => p.providerId === id)?.rank ?? PROVIDER_ORDER.length;
  const routingPriority = Math.round(((PROVIDER_ORDER.length - rank + 1) / PROVIDER_ORDER.length) * 100);
  const integrationReadiness = entry?.conformanceScore ?? 0;
  const health = healthScore(id);

  const totalScore = Math.round(
    (coverage + capabilityBreadth + simulationReadiness + routingPriority + integrationReadiness + health) / 6
  );

  return {
    providerId: id,
    name: PROVIDER_NAMES[id],
    coverage,
    capabilityBreadth,
    simulationReadiness,
    routingPriority,
    integrationReadiness,
    health,
    total: totalScore,
    badge: scoreBadge(totalScore),
  } satisfies ProviderScore;
}).sort((a, b) => b.total - a.total);

export function scoreFor(id: ProviderId): ProviderScore | undefined {
  return providerScores.find((s) => s.providerId === id);
}
