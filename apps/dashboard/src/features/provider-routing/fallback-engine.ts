/*
 * fallback-engine.ts — assigns deterministic fallback tiers to ranked
 * candidates and builds the fallback chain: Primary → Secondary → Emergency →
 * Human Escalation / Simulation Fallback / No Provider Available.
 */

import type { ProviderId } from "@/features/provider-matrix";
import type {
  ApprovalRequirement,
  FallbackTier,
  ProviderCandidate,
} from "@/features/provider-routing/types";

export interface FallbackChainLink {
  tier: FallbackTier;
  providerId: ProviderId | null;
  name: string;
}

const orderedTiers: FallbackTier[] = ["Primary", "Secondary", "Emergency"];

/** mutate candidate tiers in place and return them (deterministic order). */
export function assignTiers(candidates: ProviderCandidate[]): ProviderCandidate[] {
  return candidates.map((c, i) => ({
    ...c,
    tier: orderedTiers[i] ?? "Emergency",
  }));
}

export function buildFallbackChain(
  candidates: ProviderCandidate[],
  approval: ApprovalRequirement
): FallbackChainLink[] {
  const chain: FallbackChainLink[] = candidates
    .slice(0, orderedTiers.length)
    .map((c, i) => ({ tier: orderedTiers[i] ?? "Emergency", providerId: c.providerId, name: c.name }));

  if (chain.length === 0) {
    chain.push({ tier: "No Provider Available", providerId: null, name: "—" });
  }

  if (approval.required) {
    chain.push({ tier: "Human Escalation", providerId: null, name: "Human Approval" });
  }

  // Simulation is always the deterministic terminal fallback.
  chain.push({ tier: "Simulation Fallback", providerId: null, name: "Simulation" });

  return chain;
}
