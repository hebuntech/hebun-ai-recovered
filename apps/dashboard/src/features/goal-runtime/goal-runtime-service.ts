import {
  ensureRuntimeProjectionRegistry,
  runtimeProjectionRegistry,
} from "@/features/runtime-projection";
import { departmentMatchesStrategicLabel } from "@/features/executive-runtime-support/department-matching";
import type { GoalRuntimeModel } from "./types";

export const GoalRuntimeService = {
  listGoals(): GoalRuntimeModel[] {
    ensureRuntimeProjectionRegistry();
    return runtimeProjectionRegistry.ensure<GoalRuntimeModel[]>("goal-runtime").data;
  },

  listGoalsForDepartment(department: string): GoalRuntimeModel[] {
    return GoalRuntimeService.listGoals().filter((goal) =>
      departmentMatchesStrategicLabel(
        `${goal.title} ${goal.description}`,
        department,
      ),
    );
  },

  getGoal(id: string): GoalRuntimeModel | undefined {
    return GoalRuntimeService.listGoals().find((goal) => goal.id === id);
  },

  getPrimaryGoalForDepartment(department: string): GoalRuntimeModel | undefined {
    return GoalRuntimeService.listGoalsForDepartment(department)[0];
  },
};
