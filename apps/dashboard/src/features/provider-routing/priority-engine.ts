/*
 * priority-engine.ts — deterministic priority tie-break derived from the matrix
 * priority ranking. Lower matrix rank = higher priority. Used to break ties
 * after strategy comparison so ordering is always stable.
 */

import { priorityFor } from "@/features/provider-matrix";
import type { ProviderId } from "@/features/provider-matrix";
import type { ProviderCandidate } from "@/features/provider-routing/types";

export function priorityRank(providerId: ProviderId): number {
  return priorityFor(providerId)?.rank ?? Number.MAX_SAFE_INTEGER;
}

/** stable tie-break: lower matrix rank wins */
export function breakTie(a: ProviderCandidate, b: ProviderCandidate): number {
  return priorityRank(a.providerId) - priorityRank(b.providerId);
}
