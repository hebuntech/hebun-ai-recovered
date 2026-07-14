/*
 * provider-overlap.ts — deterministic capability overlap analysis. Two
 * providers overlap on a capability when both support it (primary or
 * secondary). Overlap score is the share of the union of their supported
 * capabilities that they both cover (Jaccard, 0–100).
 */

import {
  capabilitiesBySupport,
  PROVIDER_NAMES,
  PROVIDER_ORDER,
} from "@/features/provider-matrix/capability-matrix";
import type { MatrixCapability, ProviderId, ProviderOverlap } from "@/features/provider-matrix/types";

function supportedSet(id: ProviderId): Set<MatrixCapability> {
  return new Set([...capabilitiesBySupport(id, "primary"), ...capabilitiesBySupport(id, "secondary")]);
}

function overlap(a: ProviderId, b: ProviderId): ProviderOverlap {
  const setA = supportedSet(a);
  const setB = supportedSet(b);
  const shared = [...setA].filter((c) => setB.has(c));
  const union = new Set([...setA, ...setB]);
  const score = union.size === 0 ? 0 : Math.round((shared.length / union.size) * 100);
  return {
    a,
    b,
    sharedCapabilities: shared,
    overlapScore: score,
    note: `${PROVIDER_NAMES[a]} and ${PROVIDER_NAMES[b]} share ${shared.length} capabilit${
      shared.length === 1 ? "y" : "ies"
    } (${score}% overlap).`,
  };
}

export const providerOverlaps: ProviderOverlap[] = (() => {
  const pairs: ProviderOverlap[] = [];
  for (let i = 0; i < PROVIDER_ORDER.length; i++) {
    for (let j = i + 1; j < PROVIDER_ORDER.length; j++) {
      pairs.push(overlap(PROVIDER_ORDER[i], PROVIDER_ORDER[j]));
    }
  }
  return pairs.sort((x, y) => y.overlapScore - x.overlapScore);
})();

/** highest-overlap pairs, filtered to those that actually share capabilities */
export const significantOverlaps: ProviderOverlap[] = providerOverlaps.filter(
  (o) => o.sharedCapabilities.length > 0
);
