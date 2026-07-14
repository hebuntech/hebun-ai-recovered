import type { PlanTask, PlanningDependency } from "@/features/planning/types";

export function buildDependencies(tasks: PlanTask[]) {
  const firstTask = tasks[0];
  const lastTask = tasks[tasks.length - 1];

  const dependencies: PlanningDependency[] = tasks.map((task, index) => {
    if (index === 0) return { taskId: task.id, dependsOn: [] };
    if (index === tasks.length - 1) {
      return {
        taskId: task.id,
        dependsOn: tasks.slice(1, -1).map((candidate) => candidate.id),
      };
    }

    return { taskId: task.id, dependsOn: [firstTask.id] };
  });

  const tasksWithDependencies = tasks.map((task) => ({
    ...task,
    dependencyIds:
      dependencies.find((dependency) => dependency.taskId === task.id)?.dependsOn ?? [],
    status:
      task.id === lastTask.id && task.dependencyIds.length > 1 ? task.status : task.status,
  }));

  return {
    dependencies,
    tasks: tasksWithDependencies,
  };
}
