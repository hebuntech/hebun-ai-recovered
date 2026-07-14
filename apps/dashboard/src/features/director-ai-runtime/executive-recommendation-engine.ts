import type { OrganizationalIntelligenceInsight } from "@/features/organizational-intelligence";
import type {
  DirectorAIRecommendation,
  ExecutiveContextModel,
} from "./types";

function priorityFromSeverity(
  severity: OrganizationalIntelligenceInsight["severity"],
): DirectorAIRecommendation["priority"] {
  return severity;
}

export const ExecutiveRecommendationEngine = {
  buildRecommendations(context: ExecutiveContextModel): DirectorAIRecommendation[] {
    const riskRecommendations = context.intelligence.risks.map((risk) => ({
      id: `recommendation-${risk.id}`,
      title: risk.summary,
      summary: risk.recommendedNextAction,
      reason: `Director AI surfaced this because ${risk.category} is affecting executive operating health.`,
      confidence: risk.confidence,
      priority: priorityFromSeverity(risk.severity),
      affectedOrganization: risk.affectedOrganization,
      affectedDepartment: risk.affectedDepartment,
      affectedWorkflow: risk.affectedWorkflows[0],
      affectedAgents: risk.affectedAgents,
      recommendedActions: [risk.recommendedNextAction],
      supportingEvidence: risk.evidence,
    }));

    const opportunityRecommendations = context.intelligence.opportunities.map((opportunity) => ({
      id: `recommendation-${opportunity.id}`,
      title: opportunity.summary,
      summary: opportunity.recommendedNextAction,
      reason: `Director AI flagged this as a leverage opportunity in ${opportunity.category}.`,
      confidence: opportunity.confidence,
      priority: opportunity.severity === "critical" ? "high" : opportunity.severity,
      affectedOrganization: opportunity.affectedOrganization,
      affectedDepartment: opportunity.affectedDepartment,
      affectedWorkflow: opportunity.affectedWorkflows[0],
      affectedAgents: opportunity.affectedAgents,
      recommendedActions: [opportunity.recommendedNextAction],
      supportingEvidence: opportunity.evidence,
    }));

    const transformationRecommendations = context.transformation.recommendations.map((recommendation) => ({
      id: `director-ai-${recommendation.id}`,
      title: recommendation.title,
      summary: recommendation.summary,
      reason: recommendation.rationale,
      confidence: recommendation.confidence,
      priority: recommendation.priority,
      affectedAgents: [],
      recommendedActions: recommendation.recommendedActions,
      supportingEvidence: recommendation.evidence,
    }));

    return [...riskRecommendations, ...opportunityRecommendations, ...transformationRecommendations]
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8);
  },
};
