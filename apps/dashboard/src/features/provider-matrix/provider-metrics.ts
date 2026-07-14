/*
 * provider-metrics.ts — headline metrics for the Provider Matrix widget and
 * summary tiles. Deterministic roll-up over catalog, scores and health.
 */

import type { BadgeVariant } from "@/components/ui/badge";
import { providerCatalog } from "@/features/provider-matrix/provider-catalog";
import { networkHealth } from "@/features/provider-matrix/provider-health";
import { providerScores } from "@/features/provider-matrix/provider-score";
import { futureProviders } from "@/features/provider-matrix/provider-gaps";

const averageScore =
  providerScores.length === 0
    ? 0
    : Math.round(providerScores.reduce((sum, s) => sum + s.total, 0) / providerScores.length);

const networkBadge: BadgeVariant = networkHealth.badge;

export interface ProviderMatrixMetrics {
  providerCount: number;
  capabilityCoverage: number;
  coveredCapabilities: number;
  totalCapabilities: number;
  missingProviders: number;
  overallHealth: number;
  simulationCoverage: number;
  averageScore: number;
  badge: BadgeVariant;
}

export const providerMatrixMetrics: ProviderMatrixMetrics = {
  providerCount: providerCatalog.length,
  capabilityCoverage: networkHealth.capabilityCoverage,
  coveredCapabilities: networkHealth.coveredCapabilities,
  totalCapabilities: networkHealth.totalCapabilities,
  missingProviders: futureProviders.length,
  overallHealth: networkHealth.overallHealth,
  simulationCoverage: networkHealth.simulationCoverage,
  averageScore,
  badge: networkBadge,
};
