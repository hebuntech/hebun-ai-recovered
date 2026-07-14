import { GoalRuntimeService } from "@/features/goal-runtime";
import { MissionRuntimeService } from "@/features/mission-runtime";
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

    const assignedGoals = GoalRuntimeService.listGoalsForDepartment(agent.department).map((goal) => ({
        type: "goal" as const,
        id: goal.id,
        label: goal.title,
        status: goal.status,
        detail: goal.description,
      }));

    const assignedMissions = MissionRuntimeService.listMissionsForDepartment(agent.department)
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
