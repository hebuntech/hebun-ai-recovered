/*
 * Agent Reasoning — confidence engine.
 *
 * Computes a deterministic 0-100 confidence from five inputs: memory
 * confidence, knowledge coverage, context health, constraint completeness, and
 * the risk score (which lowers confidence). No randomness.
 */

import type { AgentContextPackage } from "@/features/agent-context";
import type {
  ConfidenceLabel,
  ConfidenceResult,
  ConstraintAnalysis,
  ReasoningQuality,
  RiskAnalysis,
} from "./types";

const CONFIDENCE_WEIGHTS = {
  memoryConfidence: 0.3,
  knowledgeCoverage: 0.2,
  contextHealth: 0.2,
  constraintCompleteness: 0.15,
  riskInverse: 0.15,
} as const;

export function evaluateConfidence(
  pkg: AgentContextPackage,
  constraints: ConstraintAnalysis,
  risk: RiskAnalysis
): ConfidenceResult {
  const memoryConfidence = pkg.context.confidence.averageConfidence;
  const knowledgeCoverage = round(pkg.report.knowledgeCoverage * 100);
  const contextHealth = pkg.report.contextHealth;
  const constraintCompleteness = round(constraints.completeness * 100);
  const riskInverse = 100 - risk.overallRisk;

  const score = clamp(
    round(
      memoryConfidence * CONFIDENCE_WEIGHTS.memoryConfidence +
        knowledgeCoverage * CONFIDENCE_WEIGHTS.knowledgeCoverage +
        contextHealth * CONFIDENCE_WEIGHTS.contextHealth +
        constraintCompleteness * CONFIDENCE_WEIGHTS.constraintCompleteness +
        riskInverse * CONFIDENCE_WEIGHTS.riskInverse
    )
  );

  return {
    score,
    label: confidenceLabel(score),
    reasoningQuality: reasoningQuality(score, risk, constraints),
    inputs: {
      memoryConfidence,
      knowledgeCoverage,
      contextHealth,
      constraintCompleteness,
      riskScore: risk.overallRisk,
    },
  };
}

function confidenceLabel(score: number): ConfidenceLabel {
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}

/**
 * Reasoning quality reflects how well-supported the decision is: strong
 * confidence with low risk and complete constraints is robust; the opposite is
 * thin.
 */
function reasoningQuality(
  score: number,
  risk: RiskAnalysis,
  constraints: ConstraintAnalysis
): ReasoningQuality {
  const support =
    score * 0.5 +
    (100 - risk.overallRisk) * 0.25 +
    constraints.completeness * 100 * 0.25;
  if (support >= 70) return "robust";
  if (support >= 45) return "adequate";
  return "thin";
}

function clamp(value: number): number {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
