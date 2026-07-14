import { getNodeSnapshot } from "@/features/knowledge-crud/node-adapter";
import { createProjectionBuilder } from "../projection-builder";
import { departmentMatchesStrategicLabel } from "@/features/executive-runtime-support/department-matching";
import type { MissionRuntimeModel } from "@/features/mission-runtime/types";

const STRATEGIC_DEPARTMENTS = [
  "sales",
  "finance",
  "legal",
  "marketing",
  "operations",
  "hr",
] as const;

function resolveFocusDepartments(title: string, description: string): string[] {
  const combined = `${title} ${description}`;
  return STRATEGIC_DEPARTMENTS.filter((department) =>
    departmentMatchesStrategicLabel(combined, department),
  );
}

function buildMissions(): MissionRuntimeModel[] {
  return getNodeSnapshot()
    .filter(
      (node) =>
        node.lifecycleStatus === "active" &&
        node.nodeType === "Organization" &&
        node.tags.includes("goals"),
    )
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
      focusDepartments: resolveFocusDepartments(node.title, node.description),
    }))
    .sort((a, b) => b.confidence - a.confidence || b.updatedAt.localeCompare(a.updatedAt));
}

export function listMissionsForDepartmentProjection(
  department: string,
): MissionRuntimeModel[] {
  const missions = buildMissions();
  const matched = missions.filter(
    (mission) =>
      mission.focusDepartments.includes(department.toLowerCase()) ||
      departmentMatchesStrategicLabel(`${mission.title} ${mission.description}`, department),
  );

  return matched.length > 0 ? matched : missions;
}

export const MissionProjectionBuilder = createProjectionBuilder({
  collection: "mission-runtime",
  owner: "Mission Runtime",
  dependencies: [],
  build: () => buildMissions(),
  count: (snapshot) => snapshot.length,
});
