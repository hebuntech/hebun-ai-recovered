import { departmentMatchesStrategicLabel } from "@/features/executive-runtime-support/department-matching";
import type { GoalRuntimeModel } from "@/features/goal-runtime/types";
import type { MissionRuntimeModel } from "@/features/mission-runtime/types";
import type {
  AgentProjectionSourceRecord,
  AgentResponsibilityProfile,
  WorkflowProjectionSourceRecord,
} from "./types";

export const AgentResponsibilityService = {
  buildResponsibilities(
    agent: AgentProjectionSourceRecord,
    workflows: WorkflowProjectionSourceRecord[],
    knowledgeNodes: unknown[],
    goals: readonly GoalRuntimeModel[],
    missions: readonly MissionRuntimeModel[],
  ): AgentResponsibilityProfile {
    void knowledgeNodes;

    const assignedWorkflows = workflows
      .filter(
        (workflow) =>
          workflow.ownerAgent === agent.name || workflow.assignedAgents.includes(agent.name),
      )
      .map((workflow) => ({
        type: "workflow" as const,
        id: workflow.id,
        label: workflow.name,
        status: workflow.status,
        detail: workflow.trigger,
      }));

    const assignedGoals = goals
      .filter((goal) =>
        departmentMatchesStrategicLabel(
          `${goal.title} ${goal.description}`,
          agent.department,
        ),
      )
      .map((goal) => ({
        type: "goal" as const,
        id: goal.id,
        label: goal.title,
        status: goal.status,
        detail: goal.description,
      }));

    const departmentMissions = missions.filter(
      (mission) =>
        mission.focusDepartments.includes(agent.department.toLowerCase()) ||
        departmentMatchesStrategicLabel(
          `${mission.title} ${mission.description}`,
          agent.department,
        ),
    );
    const assignedMissions = (departmentMissions.length > 0
      ? departmentMissions
      : missions
    )
      .slice(0, 3)
      .map((mission) => ({
        type: "mission" as const,
        id: mission.id,
        label: mission.title,
        status: mission.status,
        detail: mission.description,
      }));

    return {
      assignedWork: assignedWorkflows,
      assignedGoals,
      assignedMissions,
      assignedWorkflows,
      summary: `${assignedWorkflows.length} workflows · ${assignedGoals.length} goals · ${assignedMissions.length} missions`,
    };
  },
};
