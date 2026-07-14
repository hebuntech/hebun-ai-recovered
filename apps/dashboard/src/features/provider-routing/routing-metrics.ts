/*
 * routing-metrics.ts — deterministic headline metrics over the sample routing
 * decisions, for the widget, summary tiles and director page.
 */

import type { BadgeVariant } from "@/components/ui/badge";
import { routingDecisions } from "@/features/provider-routing/routing-pipeline";
import { strategyDefinitions } from "@/features/provider-routing/routing-strategy";
import { validateDecision } from "@/features/provider-routing/routing-validator";
import type { RoutingMetrics } from "@/features/provider-routing/types";

const total = routingDecisions.length;
const routed = routingDecisions.filter((d) => d.primaryProvider).length;
const blocked = routingDecisions.filter((d) => d.blocked).length;
const withFallback = routingDecisions.filter((d) => d.fallbackProviders.length > 0).length;
const simulation = routingDecisions.filter((d) => d.simulationMode).length;
const approvalGated = routingDecisions.filter((d) => d.approvalRequirement.required).length;
const validCount = routingDecisions.filter((d) => validateDecision(d).valid).length;

const averageConfidence =
  total === 0 ? 0 : Math.round(routingDecisions.reduce((s, d) => s + d.confidence, 0) / total);

const routingHealth = total === 0 ? 0 : Math.round((validCount / total) * 100);
const badge: BadgeVariant = routingHealth >= 90 ? "success" : routingHealth >= 75 ? "warning" : "error";

export const routingMetrics: RoutingMetrics = {
  totalRequests: total,
  routedRequests: routed,
  blockedRequests: blocked,
  routingHealth,
  activeStrategies: strategyDefinitions.length,
  primaryProviders: new Set(routingDecisions.map((d) => d.primaryProvider).filter(Boolean)).size,
  fallbackCoverage: total === 0 ? 0 : Math.round((withFallback / total) * 100),
  averageConfidence,
  simulationCoverage: total === 0 ? 0 : Math.round((simulation / total) * 100),
  approvalGatedRequests: approvalGated,
  badge,
};
