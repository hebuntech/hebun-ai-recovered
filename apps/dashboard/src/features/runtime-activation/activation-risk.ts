import type { RuntimeDecision } from "@/features/runtime-boundary";
import type { ActivationRiskAssessment } from "@/features/runtime-activation/types";

const riskScoreMap = {
  low: 25,
  medium: 60,
  high: 90,
} as const;

export function assessActivationRisk(runtimeDecision: RuntimeDecision): ActivationRiskAssessment {
  const base = riskScoreMap[runtimeDecision.riskLevel];
  const score = runtimeDecision.blocked ? Math.min(100, base + 10) : base;
  return {
    level: runtimeDecision.riskLevel,
    score,
    blocked: runtimeDecision.riskLevel === "high" && runtimeDecision.runtimeMode === "Future Live",
    note:
      runtimeDecision.riskLevel === "high"
        ? "High-risk activation stays off the live path."
        : "Risk posture is acceptable for non-live deterministic execution.",
  };
}
