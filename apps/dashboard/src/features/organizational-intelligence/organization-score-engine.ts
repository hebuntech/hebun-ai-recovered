import type {
  CapacityAssessmentModel,
  HealthAssessmentModel,
  OrganizationScoreModel,
  PerformanceAssessmentModel,
  RuntimeObservationModel,
} from "./types";

export const OrganizationScoreEngine = {
  assess(
    observations: RuntimeObservationModel,
    health: HealthAssessmentModel,
    performance: PerformanceAssessmentModel,
    capacity: CapacityAssessmentModel,
  ): OrganizationScoreModel {
    const enterpriseScore = Math.round(
      health.overallEnterpriseHealth * 0.45 +
        performance.workflowSuccess * 0.2 +
        performance.agentReadiness * 0.15 +
        observations.governance.metrics.health * 0.1 +
        (100 - Math.abs(65 - capacity.utilizationScore)) * 0.1,
    );

    return {
      enterpriseScore: Math.max(25, Math.min(100, enterpriseScore)),
      executionScore: Math.max(
        25,
        Math.min(100, Math.round(performance.workflowSuccess * 0.5 + performance.agentReadiness * 0.3 + health.workflowHealth * 0.2)),
      ),
      intelligenceScore: Math.max(
        25,
        Math.min(100, Math.round(health.knowledgeHealth * 0.45 + health.memoryHealth * 0.35 + performance.knowledgeCoverage * 0.2)),
      ),
      governanceScore: Math.max(
        25,
        Math.min(100, Math.round(observations.governance.metrics.health * 0.5 + observations.governance.metrics.complianceScore * 0.3 + observations.governance.metrics.explainabilityCoverage * 0.2)),
      ),
    };
  },
};
