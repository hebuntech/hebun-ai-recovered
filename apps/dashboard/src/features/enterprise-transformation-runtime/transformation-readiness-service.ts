import type { TransformationGap, TransformationReadiness } from "./types";

export const TransformationReadinessService = {
  fromHealthAndGaps(health: number, gaps: TransformationGap[]): TransformationReadiness {
    const penalty = Math.min(40, gaps.length * 6);
    const score = Math.max(0, Math.min(100, Math.round(health - penalty)));
    const status =
      score >= 85 ? "advanced" : score >= 70 ? "ready" : score >= 45 ? "emerging" : "unready";

    return {
      score,
      status,
      summary: `${score}% readiness with ${gaps.length} evidence-backed transformation gaps.`,
    };
  },
};
