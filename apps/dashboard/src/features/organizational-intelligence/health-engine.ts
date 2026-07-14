import type { DepartmentRuntimeModel } from "@/features/organization-runtime";
import type { HealthAssessmentModel, RuntimeObservationModel } from "./types";

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function departmentTrend(department: DepartmentRuntimeModel): string {
  if (department.health.status === "critical") return "Needs attention";
  if (department.health.status === "watch") return "Mixed load";
  return "Stable";
}

export const HealthEngine = {
  assess(observations: RuntimeObservationModel): HealthAssessmentModel {
    const agentHealth = average(observations.agents.map((agent) => agent.health.score));
    const workflowHealth = average(observations.workflows.map((workflow) => workflow.health.score));
    const knowledgeHealth = Math.max(
      35,
      Math.min(
        100,
        Math.round(
          observations.knowledge.verifiedKnowledge * 3 +
            observations.performanceSeed.knowledgeCoverage * 0.55 -
            observations.knowledge.lowCoverageAgents * 4 -
            observations.knowledge.lowCoverageWorkflows * 6,
        ),
      ),
    );
    const memoryHealth = Math.max(
      35,
      Math.min(
        100,
        Math.round(
          observations.memory.report.averageConfidence * 0.6 +
            observations.memory.report.knowledgeCoverage * 100 * 0.3 -
            observations.memory.lowCoverageWorkflows * 5,
        ),
      ),
    );
    const transformationHealth = Math.max(
      30,
      Math.min(
        100,
        Math.round(
          observations.company.health.score * 0.25 +
            agentHealth * 0.2 +
            workflowHealth * 0.2 +
            observations.governance.metrics.health * 0.2 +
            knowledgeHealth * 0.15,
        ),
      ),
    );
    const organizationHealth = Math.max(
      35,
      Math.min(
        100,
        Math.round(
          observations.company.health.score * 0.45 +
            average(observations.departments.map((department) => department.health.score)) * 0.35 +
            observations.governance.metrics.health * 0.2,
        ),
      ),
    );
    const overallEnterpriseHealth = average([
      organizationHealth,
      agentHealth,
      workflowHealth,
      knowledgeHealth,
      memoryHealth,
      transformationHealth,
    ]);

    return {
      overallEnterpriseHealth,
      organizationHealth,
      departmentHealth: observations.departments
        .map((department) => ({
          id: department.identity.id,
          label: department.identity.name,
          score: department.health.score,
          detail: `${department.agents.length} agents · ${department.responsibilities.responsibleWorkflows.length} workflows · ${department.humans.length} humans`,
          trend: departmentTrend(department),
        }))
        .sort((a, b) => a.score - b.score),
      agentHealth,
      workflowHealth,
      knowledgeHealth,
      memoryHealth,
      transformationHealth,
    };
  },
};
