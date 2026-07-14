/*
 * Workflow CRUD — queries.
 */

import type { LifecycleStatus } from "@/features/persistence";
import { findAll, findById } from "./workflow-repository";
import type { WorkflowCrudRecord } from "./types";

export async function listAll(): Promise<WorkflowCrudRecord[]> {
  return findAll();
}

export async function listByStatus(
  status: LifecycleStatus
): Promise<WorkflowCrudRecord[]> {
  return (await findAll()).filter((record) => record.lifecycleStatus === status);
}

export async function getById(id: string): Promise<WorkflowCrudRecord | undefined> {
  return findById(id);
}

export async function search(term: string): Promise<WorkflowCrudRecord[]> {
  const query = term.trim().toLowerCase();
  const records = await findAll();
  if (!query) return records;
  return records.filter((record) => {
    const haystack = [
      record.id,
      record.name,
      record.slug,
      record.department,
      record.category,
      record.owner,
      record.trigger,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}
