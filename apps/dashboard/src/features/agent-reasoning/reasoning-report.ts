/*
 * Agent Reasoning — report projection.
 *
 * Flattens a Decision Package into a compact report for dashboards and the
 * Director overview. No new computation — just a stable projection.
 */

import type { DecisionPackage, ReasoningReport } from "./types";

export function buildReasoningReport(decision: DecisionPackage): ReasoningReport {
  return {
    agentId: decision.agentId,
    agentName: decision.agentName,
    primaryGoal: decision.goal.primaryGoal,
    recommendedAction: decision.recommendedOption.label,
    recommendedOptionId: decision.recommendedOption.id,
    confidence: decision.confidence.score,
    confidenceLabel: decision.confidence.label,
    reasoningQuality: decision.confidence.reasoningQuality,
    risk: decision.risk.overallRisk,
    riskLabel: decision.risk.label,
    optionCount: decision.options.length,
  };
}
