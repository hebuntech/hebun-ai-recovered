import type { GoalRuntimeModel } from "@/features/goal-runtime/types";
import type { GeneratedPlan } from "@/features/planning/types";
import type { MissionRuntimeModel } from "@/features/mission-runtime/types";
import { departmentMatchesStrategicLabel } from "@/features/executive-runtime-support/department-matching";
import type { WorkflowProjectionSourceRecord, WorkflowRuntimeWorkItem } from "./types";

function normalize(value: string): string {
  return value.toLowerCase();
}

function buildMission(
  workflow: WorkflowProjectionSourceRecord,
  missions: readonly MissionRuntimeModel[],
): WorkflowRuntimeWorkItem | undefined {
  const normalizedDepartment = workflow.department.toLowerCase();
  const mission =
    missions.find(
      (candidate) =>
        candidate.focusDepartments.includes(normalizedDepartment) ||
        departmentMatchesStrategicLabel(
          `${candidate.title} ${candidate.description}`,
          workflow.department,
        ),
    ) ?? missions[0];

  return mission
    ? {
        type: "mission",
        id: mission.id,
        label: mission.title,
        status: mission.status,
        detail: mission.description,
      }
    : undefined;
}

function buildGoal(
  workflow: WorkflowProjectionSourceRecord,
  goals: readonly GoalRuntimeModel[],
): WorkflowRuntimeWorkItem | undefined {
  const goal = goals.find((candidate) =>
    departmentMatchesStrategicLabel(
      `${candidate.title} ${candidate.description}`,
      workflow.department,
    ),
  );

  return goal
    ? {
        type: "goal",
        id: goal.id,
        label: goal.title,
        status: goal.status,
        detail: goal.description,
      }
    : undefined;
}

function planMatchesWorkflow(plan: GeneratedPlan, workflow: WorkflowProjectionSourceRecord, goal?: WorkflowRuntimeWorkItem): boolean {
  if (plan.requiredAgents.includes(workflow.ownerAgent)) return true;
  if (plan.requiredAgents.some((agent) => workflow.assignedAgents.includes(agent))) return true;
  if (goal && plan.goalId === goal.id) return true;
  return normalize(plan.title).includes(normalize(workflow.department)) || normalize(plan.description).includes(normalize(workflow.category));
}

export const WorkflowResponsibilityService = {
  buildMission(
    workflow: WorkflowProjectionSourceRecord,
    missions: readonly MissionRuntimeModel[],
  ): WorkflowRuntimeWorkItem | undefined {
    return buildMission(workflow, missions);
  },

  buildGoal(
    workflow: WorkflowProjectionSourceRecord,
    goals: readonly GoalRuntimeModel[],
  ): WorkflowRuntimeWorkItem | undefined {
    return buildGoal(workflow, goals);
  },

  buildPlan(
    workflow: WorkflowProjectionSourceRecord,
    plan: GeneratedPlan | undefined,
    goals: readonly GoalRuntimeModel[],
  ): WorkflowRuntimeWorkItem | undefined {
    const goal = buildGoal(workflow, goals);
    if (!plan || !planMatchesWorkflow(plan, workflow, goal)) {
      return undefined;
    }

    return {
      type: "plan",
      id: plan.id,
      label: plan.title,
      status: plan.status,
      detail: plan.description,
    };
  },
};
