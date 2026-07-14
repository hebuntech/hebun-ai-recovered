/*
 * Workflow CRUD — projections for existing UI surfaces.
 */

import type { RegistryRecord } from "@/features/registries/types";
import type { Workflow } from "@/types";
import type { WorkflowCrudRecord } from "./types";

export function toWorkflowCards(records: WorkflowCrudRecord[]): Workflow[] {
  return records
    .filter((record) => record.lifecycleStatus !== "deleted")
    .map((record) => ({
      id: record.id,
      name: record.name,
      trigger: record.trigger,
      ownerAgent: record.ownerAgent,
      status: record.status,
      successRate: record.successRate,
      runsToday: record.runsToday,
      lastRun: record.lastRun,
    }));
}

export function toRegistryRecords(records: WorkflowCrudRecord[]): RegistryRecord[] {
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
    consumers: [record.department, record.executionMode],
    dependency: record.dependencies[0] ?? "None",
    updated: record.updatedAt,
    change: `${record.trigger} · ${record.lifecycleStatus}`,
    health: Math.max(78, 100 - record.steps.length),
  }));
}
