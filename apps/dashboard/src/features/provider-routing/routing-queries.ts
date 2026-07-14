/*
 * routing-queries.ts — read-only query helpers over the routing engine. Pure
 * lookups; no execution, no runtime provider invocation.
 */

import { route } from "@/features/provider-routing/routing-engine";
import { routingDecisions, decisionByRequestId, routingPipeline } from "@/features/provider-routing/routing-pipeline";
import { routingReports, buildReport } from "@/features/provider-routing/routing-report";
import { sampleRequests } from "@/features/provider-routing/routing-rules";
import { strategyDefinitions } from "@/features/provider-routing/routing-strategy";
import { routingMetrics } from "@/features/provider-routing/routing-metrics";
import type { RoutingExecutionRequest } from "@/features/provider-routing/types";

export function routeRequest(request: RoutingExecutionRequest) {
  return route(request);
}

export function getRoutingDecisions() {
  return routingDecisions;
}

export function getRoutingDecision(requestId: string) {
  return decisionByRequestId(requestId);
}

export function getRoutingReport(requestId: string) {
  const decision = decisionByRequestId(requestId);
  return decision ? buildReport(decision) : undefined;
}

export function getRoutingReports() {
  return routingReports;
}

export function getSampleRequests() {
  return sampleRequests;
}

export function getRoutingPipeline() {
  return routingPipeline;
}

export function getStrategyDefinitions() {
  return strategyDefinitions;
}

export function getRoutingMetrics() {
  return routingMetrics;
}
