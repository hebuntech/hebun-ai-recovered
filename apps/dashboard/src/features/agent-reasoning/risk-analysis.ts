/*
 * Agent Reasoning — risk analysis.
 *
 * Blends five deterministic risk signals into an overall 0-100 risk score.
 * Higher = riskier. Reads the Context Package and the constraint analysis; no
 * randomness, no external calls.
 */

import type { AgentContextPackage } from "@/features/agent-context";
import type { ConstraintAnalysis, RiskAnalysis, RiskLabel } from "./types";

const RISK_WEIGHTS = {
  policy: 0.25,
  knowledgeGap: 0.2,
  missingContext: 0.2,
  lowConfidence: 0.2,
  dependency: 0.15,
} as const;

export function analyzeRisk(
  pkg: AgentContextPackage,
  constraints: ConstraintAnalysis
): RiskAnalysis {
  const { context, report } = pkg;

  // Policy risk: high when no policy governs a high-importance decision.
  const hasCriticalMemory = context.memories.some(
    (entry) => entry.record.importance === "critical" || entry.record.importance === "high"
  );
  const policyRisk =
    constraints.policies.length === 0 ? (hasCriticalMemory ? 90 : 60) : 15;

  // Knowledge-gap risk: inverse of coverage.
  const knowledgeGapRisk = clamp(round((1 - report.knowledgeCoverage) * 100));

  // Missing-context risk: scaled by number of missing-information flags.
  const missingContextRisk = clamp(constraints.missingInformation.length * 25);

  // Low-confidence risk: inverse of retrieval confidence.
  const lowConfidenceRisk = clamp(round(100 - context.confidence.averageConfidence));

  // Dependency risk: unresolved linked relationships relative to nodes.
  const dependencyRisk = computeDependencyRisk(report.relationships, report.knowledgeNodes);

  const overallRisk = clamp(
    round(
      policyRisk * RISK_WEIGHTS.policy +
        knowledgeGapRisk * RISK_WEIGHTS.knowledgeGap +
        missingContextRisk * RISK_WEIGHTS.missingContext +
        lowConfidenceRisk * RISK_WEIGHTS.lowConfidence +
        dependencyRisk * RISK_WEIGHTS.dependency
    )
  );

  const factors: string[] = [];
  if (policyRisk >= 60) factors.push("Weak or absent policy coverage");
  if (knowledgeGapRisk >= 50) factors.push("Low knowledge-graph coverage");
  if (missingContextRisk >= 50) factors.push("Multiple missing-information gaps");
  if (lowConfidenceRisk >= 40) factors.push("Retrieval confidence below target");
  if (dependencyRisk >= 50) factors.push("Many unresolved knowledge dependencies");

  return {
    policyRisk,
    knowledgeGapRisk,
    missingContextRisk,
    lowConfidenceRisk,
    dependencyRisk,
    overallRisk,
    label: riskLabel(overallRisk),
    factors,
  };
}

/** More edges per node reads as heavier dependency load to resolve. */
function computeDependencyRisk(relationships: number, nodes: number): number {
  if (nodes === 0) return relationships > 0 ? 50 : 0;
  const ratio = relationships / nodes;
  return clamp(round(Math.min(ratio, 4) * 20));
}

function riskLabel(score: number): RiskLabel {
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}

function clamp(value: number): number {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
