/*
 * Workflow CRUD — repository.
 */

import { createRepository } from "@/features/persistence";
import { workflowAdapter } from "./workflow-adapter";
import type { LifecycleStatus } from "@/features/persistence";
import type { WorkflowCrudRecord } from "./types";

const repository = createRepository(workflowAdapter);

export async function findAll(): Promise<WorkflowCrudRecord[]> {
  return repository.findAll();
}

export async function findById(id: string): Promise<WorkflowCrudRecord | undefined> {
  return repository.findById(id);
}

export async function insert(record: WorkflowCrudRecord): Promise<void> {
  await repository.insert(record);
}

export async function update(
  id: string,
  patch: Partial<WorkflowCrudRecord>
): Promise<WorkflowCrudRecord | undefined> {
  return repository.update(id, { ...patch, updatedAt: new Date().toISOString() });
}

export async function setStatus(
  id: string,
  status: LifecycleStatus
): Promise<WorkflowCrudRecord | undefined> {
  if (status === "archived") return repository.archive(id);
  if (status === "active") return repository.restore(id);
  return repository.softDelete(id);
}
