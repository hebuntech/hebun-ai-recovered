import { latestReasoningResult } from "@/features/reasoning/reasoning-queries";
import { reasoningResults } from "@/features/reasoning/reasoning-pipeline";
import type { ReasoningMetrics } from "@/features/reasoning/types";

const averageConfidence = Math.round(
  reasoningResults.reduce((sum, result) => sum + result.confidenceScore, 0) /
    Math.max(reasoningResults.length, 1)
);
const health = Math.round(
  averageConfidence * 0.65 +
    reasoningResults.filter((result) => result.riskLevel === "low" || result.riskLevel === "medium")
      .length *
      10
);

export const reasoningMetrics: ReasoningMetrics = {
  latestRecommendation: latestReasoningResult()?.recommendation.title ?? "No recommendation",
  averageConfidence,
  openSessions: reasoningResults.filter((result) => result.riskLevel !== "low").length,
  health: Math.max(0, Math.min(100, health)),
  healthBadge:
    health >= 90 ? "success" : health >= 82 ? "warning" : "error",
  totalSessions: reasoningResults.length,
};
