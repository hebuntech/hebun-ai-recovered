import type {
  TransformationInitiative,
  TransformationRecommendation,
} from "./types";

export const TransformationRecommendationEngine = {
  build(initiatives: TransformationInitiative[]): TransformationRecommendation[] {
    return initiatives.slice(0, 6).map((initiative) => ({
      id: `recommendation-${initiative.id}`,
      title: initiative.title,
      summary: initiative.objective,
      rationale: initiative.rationale,
      priority: initiative.priority.level,
      confidence: initiative.priority.confidence,
      affectedDomains: initiative.affectedDomains,
      recommendedActions: [initiative.objective, initiative.expectedOutcome],
      evidence: initiative.evidence,
    }));
  },
};
