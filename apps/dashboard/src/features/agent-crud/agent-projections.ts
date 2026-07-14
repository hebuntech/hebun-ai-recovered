/*
 * Agent CRUD — projections for existing UI surfaces.
 */

import type { Department } from "@/types";
import type { RegistryRecord } from "@/features/registries/types";
import type { AgentCrudRecord } from "./types";

export function toDepartmentSummaries(records: AgentCrudRecord[]): Department[] {
  return [...new Set(records.map((record) => record.department))]
    .sort((a, b) => a.localeCompare(b))
    .map((department) => {
      const departmentAgents = records.filter(
        (record) => record.department === department && record.lifecycleStatus !== "deleted"
      );
      return {
        id: `dept-${department.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        name: department,
        headAgent: departmentAgents[0]?.name ?? "Unassigned",
        agents: departmentAgents.map((record) => record.name),
      };
    });
}

export function toRegistryRecords(records: AgentCrudRecord[]): RegistryRecord[] {
  return records.map((record) => ({
    id: record.id,
    name: record.name,
    status:
      record.lifecycleStatus === "deleted"
        ? "deprecated"
        : record.lifecycleStatus === "archived"
          ? "archived"
          : "active",
    owner: record.owner,
    consumers: [record.department, record.runtime],
    dependency: record.provider,
    updated: record.updatedAt,
    change: `${record.model} · ${record.lifecycleStatus}`,
    health: Math.max(78, 100 - record.capabilities.length),
  }));
}
