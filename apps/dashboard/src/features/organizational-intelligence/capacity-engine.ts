import type { AgentEmployeeRuntimeModel } from "@/features/agent-runtime";
import type { CapacityAssessmentModel, RuntimeObservationModel } from "./types";

function isIdle(agent: AgentEmployeeRuntimeModel): boolean {
  return agent.status === "idle" || agent.workload.state === "light";
}

export const CapacityEngine = {
  assess(observations: RuntimeObservationModel): CapacityAssessmentModel {
    const idleAgents = observations.agents.filter(isIdle).length;
    const overloadedAgents = observations.agents.filter(
      (agent) => agent.workload.state === "overloaded" || agent.riskLevel === "critical",
    ).length;
    const availableCapacity = Math.max(0, idleAgents - overloadedAgents);
    const utilizationScore = Math.max(
      20,
      Math.min(
        100,
        Math.round(
          observations.agents.reduce((sum, agent) => sum + agent.workload.utilizationScore, 0) /
            Math.max(1, observations.agents.length),
        ),
      ),
    );

    return {
      idleAgents,
      overloadedAgents,
      availableCapacity,
      utilizationScore,
    };
  },
};
