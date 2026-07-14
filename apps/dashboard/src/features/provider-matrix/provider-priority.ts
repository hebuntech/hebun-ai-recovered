/*
 * provider-priority.ts — deterministic priority scoring. Every provider is a
 * primary owner of at least one capability today, so all six sit at the
 * "Primary" tier; the rank orders them by breadth of primary ownership. Tiers
 * Fallback / Disabled / Experimental / Future exist for future providers.
 */

import type { BadgeVariant } from "@/components/ui/badge";
import { capabilitiesBySupport, PROVIDER_NAMES, PROVIDER_ORDER } from "@/features/provider-matrix/capability-matrix";
import type { PriorityTier, ProviderId, ProviderPriority } from "@/features/provider-matrix/types";

/** Declared tier per provider. All active providers are Primary owners today. */
const tierByProvider: Record<ProviderId, PriorityTier> = {
  claude: "Primary",
  codex: "Primary",
  github: "Primary",
  browser: "Primary",
  "computer-use": "Primary",
  communication: "Primary",
};

const tierBadge: Record<PriorityTier, BadgeVariant> = {
  Primary: "success",
  Secondary: "info",
  Fallback: "warning",
  Disabled: "neutral",
  Experimental: "warning",
  Future: "neutral",
};

export function priorityTierFor(id: ProviderId): PriorityTier {
  return tierByProvider[id];
}

/** Rank by number of primary capabilities owned (desc), stable by provider order. */
export const providerPriorities: ProviderPriority[] = PROVIDER_ORDER.map((id) => {
  const primaryCount = capabilitiesBySupport(id, "primary").length;
  return { id, primaryCount };
})
  .sort((a, b) => b.primaryCount - a.primaryCount || PROVIDER_ORDER.indexOf(a.id) - PROVIDER_ORDER.indexOf(b.id))
  .map((entry, index) => {
    const tier = tierByProvider[entry.id];
    return {
      providerId: entry.id,
      tier,
      rank: index + 1,
      rationale: `${PROVIDER_NAMES[entry.id]} is the primary owner of ${entry.primaryCount} capabilit${
        entry.primaryCount === 1 ? "y" : "ies"
      }.`,
      badge: tierBadge[tier],
    } satisfies ProviderPriority;
  });

export function priorityFor(id: ProviderId): ProviderPriority | undefined {
  return providerPriorities.find((p) => p.providerId === id);
}
