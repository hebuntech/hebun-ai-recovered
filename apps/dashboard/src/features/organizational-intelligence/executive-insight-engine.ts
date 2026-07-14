import type {
  CapacityAssessmentModel,
  HealthAssessmentModel,
  OrganizationalIntelligenceInsight,
  PerformanceAssessmentModel,
  RuntimeObservationModel,
} from "./types";

function now(): string {
  return new Date().toISOString();
}

export const ExecutiveInsightEngine = {
  summarize(
    observations: RuntimeObservationModel,
    health: HealthAssessmentModel,
    performance: PerformanceAssessmentModel,
    capacity: CapacityAssessmentModel,
  ): OrganizationalIntelligenceInsight[] {
    return [
      {
        id: "executive-health-summary",
        type: "executive",
        severity: health.overallEnterpriseHealth < 75 ? "high" : "medium",
        confidence: 92,
        category: "enterprise-health",
        sourceRuntime: "organizational-intelligence",
        affectedOrganization: observations.company.identity.name,
        affectedAgents: [],
        affectedWorkflows: [],
        summary: `Enterprise health is ${health.overallEnterpriseHealth}% with workflow health at ${health.workflowHealth}% and agent health at ${health.agentHealth}%.`,
        evidence: [
          `${observations.departments.length} departments are being observed.`,
          `${observations.workflows.length} workflows are active in the runtime.`,
          `${observations.agents.length} agents are currently resolved.`,
        ],
        recommendedNextAction: "Start with the lowest-health department and the most blocked workflow before expanding scope.",
        createdAt: now(),
      },
      {
        id: "executive-capacity-summary",
        type: "executive",
        severity: capacity.overloadedAgents > capacity.idleAgents ? "high" : "low",
        confidence: 86,
        category: "capacity-balance",
        sourceRuntime: "organizational-intelligence",
        affectedOrganization: observations.company.identity.name,
        affectedAgents: [],
        affectedWorkflows: [],
        summary: `${capacity.idleAgents} idle/light agents and ${capacity.overloadedAgents} overloaded agents define today's operating balance.`,
        evidence: [
          `Average agent readiness is ${performance.agentReadiness}%.`,
          `Capacity utilization is ${capacity.utilizationScore}%.`,
        ],
        recommendedNextAction: "Rebalance assignments before introducing new workflow complexity.",
        createdAt: now(),
      },
    ];
  },
};
