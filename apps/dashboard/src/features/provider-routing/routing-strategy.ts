/*
 * routing-strategy.ts — deterministic routing strategies. Each strategy defines
 * how scored candidates are ordered and whether the decision fans out to
 * multiple providers, escalates to a human, or stays simulation-only.
 */

import type { ProviderCandidate, RoutingStrategy } from "@/features/provider-routing/types";

export interface StrategyDefinition {
  strategy: RoutingStrategy;
  label: string;
  description: string;
  multi: boolean;
  humanFirst: boolean;
  simulationOnly: boolean;
  /** deterministic comparator over already-scored candidates */
  compare: (a: ProviderCandidate, b: ProviderCandidate) => number;
}

const byConfidence = (a: ProviderCandidate, b: ProviderCandidate) => b.confidence - a.confidence;
const byCapability = (a: ProviderCandidate, b: ProviderCandidate) =>
  b.capabilityScore - a.capabilityScore || byConfidence(a, b);
const byHealth = (a: ProviderCandidate, b: ProviderCandidate) =>
  b.healthScore - a.healthScore || byConfidence(a, b);
const byPolicy = (a: ProviderCandidate, b: ProviderCandidate) =>
  b.policyScore - a.policyScore || byConfidence(a, b);
const byLatency = (a: ProviderCandidate, b: ProviderCandidate) =>
  a.latencyMs - b.latencyMs || byConfidence(a, b);
const byReliability = (a: ProviderCandidate, b: ProviderCandidate) =>
  b.reliability - a.reliability || byHealth(a, b);

export const strategyDefinitions: StrategyDefinition[] = [
  { strategy: "Best Capability", label: "Best Capability", description: "Ranks by capability match strength.", multi: false, humanFirst: false, simulationOnly: false, compare: byCapability },
  { strategy: "Highest Confidence", label: "Highest Confidence", description: "Ranks by overall routing confidence.", multi: false, humanFirst: false, simulationOnly: false, compare: byConfidence },
  { strategy: "Lowest Risk", label: "Lowest Risk", description: "Prefers the most reliable, healthiest provider.", multi: false, humanFirst: false, simulationOnly: false, compare: byReliability },
  { strategy: "Fastest Provider", label: "Fastest Provider", description: "Prefers the lowest simulated latency.", multi: false, humanFirst: false, simulationOnly: false, compare: byLatency },
  { strategy: "Health First", label: "Health First", description: "Prefers the healthiest provider.", multi: false, humanFirst: false, simulationOnly: false, compare: byHealth },
  { strategy: "Policy First", label: "Policy First", description: "Prefers the provider with the strongest policy fit.", multi: false, humanFirst: false, simulationOnly: false, compare: byPolicy },
  { strategy: "Approval First", label: "Approval First", description: "Prefers approval-gated providers for sensitive actions.", multi: false, humanFirst: false, simulationOnly: false, compare: byPolicy },
  { strategy: "Single Provider", label: "Single Provider", description: "Selects exactly one provider, no fan-out.", multi: false, humanFirst: false, simulationOnly: false, compare: byConfidence },
  { strategy: "Multi Provider", label: "Multi Provider", description: "Allows cooperating providers on one request.", multi: true, humanFirst: false, simulationOnly: false, compare: byCapability },
  { strategy: "Human First", label: "Human First", description: "Escalates to human approval before any provider.", multi: false, humanFirst: true, simulationOnly: false, compare: byConfidence },
  { strategy: "Simulation Only", label: "Simulation Only", description: "Restricts routing to simulation-capable providers.", multi: false, humanFirst: false, simulationOnly: true, compare: byConfidence },
];

export function strategyDefinition(strategy: RoutingStrategy): StrategyDefinition {
  return strategyDefinitions.find((s) => s.strategy === strategy) ?? strategyDefinitions[1];
}
