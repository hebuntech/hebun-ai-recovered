import { getNodeSnapshot } from "@/features/knowledge-crud/node-adapter";
import { createProjectionBuilder } from "../projection-builder";
import { departmentMatchesStrategicLabel } from "@/features/executive-runtime-support/department-matching";
import type { GoalRuntimeModel } from "@/features/goal-runtime/types";

function buildGoals(): GoalRuntimeModel[] {
  return getNodeSnapshot()
    .filter((node) => node.nodeType === "Goal" && node.lifecycleStatus === "active")
    .map((node) => ({
      id: node.id,
      slug: node.slug,
      title: node.title,
      description: node.description,
      status: node.status,
      source: node.source,
      confidence: node.confidence,
      ownerType: node.ownerType,
      ownerId: node.ownerId,
      tags: [...node.tags],
      updatedAt: node.updatedAt,
    }))
    .sort((a, b) => b.confidence - a.confidence || b.updatedAt.localeCompare(a.updatedAt));
}

export function listGoalsForDepartmentProjection(department: string): GoalRuntimeModel[] {
  return buildGoals().filter((goal) =>
    departmentMatchesStrategicLabel(`${goal.title} ${goal.description}`, department),
  );
}

export const GoalProjectionBuilder = createProjectionBuilder({
  collection: "goal-runtime",
  owner: "Goal Runtime",
  dependencies: [],
  build: () => buildGoals(),
  count: (snapshot) => snapshot.length,
});
