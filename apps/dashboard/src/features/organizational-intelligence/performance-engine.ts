import type { PerformanceAssessmentModel, RuntimeObservationModel } from "./types";

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export const PerformanceEngine = {
  assess(observations: RuntimeObservationModel): PerformanceAssessmentModel {
    return {
      workflowSuccess: average(observations.workflows.map((workflow) => workflow.progress.successRate)),
      workflowThroughput: observations.workflows.reduce((sum, workflow) => sum + workflow.progress.runsToday, 0),
      agentReadiness: average(observations.agents.map((agent) => agent.executionReadiness.score)),
      governanceHealth: observations.governance.metrics.health,
      knowledgeCoverage: Math.round(observations.memory.report.knowledgeCoverage * 100),
    };
  },
};
