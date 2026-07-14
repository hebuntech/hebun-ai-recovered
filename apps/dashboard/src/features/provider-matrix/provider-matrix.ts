/*
 * provider-matrix.ts — assembles the full ProviderMatrix aggregate from every
 * derived slice. This is the single object the UI and any consumer reads.
 */

import { capabilityMatrix } from "@/features/provider-matrix/capability-matrix";
import { executionModes } from "@/features/provider-matrix/execution-modes";
import { providerCatalog } from "@/features/provider-matrix/provider-catalog";
import { capabilityGaps, futureProviders } from "@/features/provider-matrix/provider-gaps";
import { networkHealth } from "@/features/provider-matrix/provider-health";
import { providerOverlaps } from "@/features/provider-matrix/provider-overlap";
import { providerPriorities } from "@/features/provider-matrix/provider-priority";
import { routingRules } from "@/features/provider-matrix/provider-routing";
import { providerScores } from "@/features/provider-matrix/provider-score";
import type { ProviderMatrix } from "@/features/provider-matrix/types";

export const providerMatrix: ProviderMatrix = {
  catalog: providerCatalog,
  matrix: capabilityMatrix,
  executionModes,
  routing: routingRules,
  priorities: providerPriorities,
  overlaps: providerOverlaps,
  gaps: capabilityGaps,
  futureProviders,
  scores: providerScores,
  health: networkHealth,
};
