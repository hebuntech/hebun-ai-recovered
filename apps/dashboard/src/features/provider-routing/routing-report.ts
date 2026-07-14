/*
 * routing-report.ts — turns a RoutingDecision into an explainable, audit-ready
 * routing report: why selected, why rejected, per-dimension scores, the
 * fallback chain and a risk assessment. Deterministic.
 */

import { buildFallbackChain } from "@/features/provider-routing/fallback-engine";
import { riskBadge, riskLevel } from "@/features/provider-routing/confidence-engine";
import { routingDecisions } from "@/features/provider-routing/routing-pipeline";
import { sampleRequests } from "@/features/provider-routing/routing-rules";
import type { RoutingDecision, RoutingReport } from "@/features/provider-routing/types";

export function buildReport(decision: RoutingDecision): RoutingReport {
  const primary = decision.candidateProviders[0];
  const description =
    sampleRequests.find((r) => r.requestId === decision.requestId)?.description ?? decision.requestId;
  const level = riskLevel(decision.confidence);

  return {
    decisionId: decision.id,
    requestId: decision.requestId,
    description,
    strategy: decision.strategy,
    whySelected: decision.selectionReason,
    whyRejected: decision.rejectedProviders.map((r) => `${r.name}: ${r.reason} (${r.stage})`),
    capabilityScore: primary?.capabilityScore ?? 0,
    healthScore: primary?.healthScore ?? 0,
    policyScore: primary?.policyScore ?? 0,
    confidenceScore: decision.confidence,
    fallbackChain: buildFallbackChain(decision.candidateProviders, decision.approvalRequirement),
    riskLevel: level,
    riskBadge: riskBadge(level),
  };
}

export const routingReports: RoutingReport[] = routingDecisions.map(buildReport);
