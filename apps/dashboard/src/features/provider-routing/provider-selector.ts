/*
 * provider-selector.ts — runs the deterministic filter + rank pipeline over the
 * routing context and returns scored candidates, rejected providers and the
 * per-stage funnel. Pure functions; no execution, no side effects.
 */

import { getCatalogEntry, PROVIDER_NAMES } from "@/features/provider-matrix";
import { matchCapabilities } from "@/features/provider-routing/capability-matcher";
import { assessHealth, healthScore } from "@/features/provider-routing/health-filter";
import { evaluateConstraints } from "@/features/provider-routing/constraint-filter";
import { computeConfidence } from "@/features/provider-routing/confidence-engine";
import { breakTie } from "@/features/provider-routing/priority-engine";
import { strategyDefinition } from "@/features/provider-routing/routing-strategy";
import type { RoutingContext } from "@/features/provider-routing/routing-context";
import type {
  ProviderCandidate,
  RejectedProvider,
  RoutingStageResult,
} from "@/features/provider-routing/types";

export interface SelectionResult {
  candidates: ProviderCandidate[];
  rejected: RejectedProvider[];
  stages: RoutingStageResult[];
}

export function selectProviders(context: RoutingContext): SelectionResult {
  const { request, providers, simulationOnly } = context;
  const rejected: RejectedProvider[] = [];
  const candidates: ProviderCandidate[] = [];

  const total = providers.length;
  let afterCapability = 0;
  let afterHealth = 0;
  let afterConstraint = 0;

  for (const entry of providers) {
    const name = PROVIDER_NAMES[entry.id];

    // 1. Capability filter
    const match = matchCapabilities(entry.id, request.requiredCapabilities);
    if (match.matched.length === 0) {
      rejected.push({ providerId: entry.id, name, stage: "capability", reason: `No match for ${request.requiredCapabilities.join(", ")}.` });
      continue;
    }
    afterCapability++;

    // 2. Health filter
    const assessment = assessHealth(entry.id);
    if (!assessment.healthy) {
      rejected.push({ providerId: entry.id, name, stage: "health", reason: `Provider status ${assessment.status}.` });
      continue;
    }
    afterHealth++;

    // 3. Simulation-only guard
    if (simulationOnly && !entry.simulationSupport) {
      rejected.push({ providerId: entry.id, name, stage: "constraint", reason: "Simulation-only routing; provider not simulation-capable." });
      continue;
    }

    // 4. Constraint + policy filter
    const constraint = evaluateConstraints(entry.id, request);
    if (!constraint.satisfied) {
      rejected.push({ providerId: entry.id, name, stage: "constraint", reason: constraint.reason });
      continue;
    }
    afterConstraint++;

    const hScore = healthScore(entry.id);
    const confidence = computeConfidence(match.score, hScore, constraint.policyScore);
    const catalog = getCatalogEntry(entry.id);

    candidates.push({
      providerId: entry.id,
      name,
      tier: "Primary",
      matchedCapabilities: match.matched,
      capabilityScore: match.score,
      healthScore: hScore,
      policyScore: constraint.policyScore,
      confidence,
      latencyMs: assessment.latencyMs,
      reliability: catalog?.conformanceScore ?? assessment.reliability,
    });
  }

  // 5. Rank by strategy, stable tie-break by matrix priority
  const def = strategyDefinition(request.strategy);
  candidates.sort((a, b) => def.compare(a, b) || breakTie(a, b));

  const stages: RoutingStageResult[] = [
    { stage: "capability", label: "Capability filter", input: total, output: afterCapability, note: `Matched ${request.requiredCapabilities.join(", ")}.` },
    { stage: "health", label: "Health filter", input: afterCapability, output: afterHealth, note: "Healthy providers retained." },
    { stage: "constraint", label: "Constraint filter", input: afterHealth, output: afterConstraint, note: "Execution mode + policy checks." },
    { stage: "ranking", label: "Ranking", input: afterConstraint, output: candidates.length, note: `Strategy: ${request.strategy}.` },
  ];

  return { candidates, rejected, stages };
}
