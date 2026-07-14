/*
 * Agent CRUD — queries.
 */

import { findAll, findById } from "./agent-repository";
import type { LifecycleStatus } from "@/features/persistence";
import type { AgentCrudRecord } from "./types";

export async function listAll(): Promise<AgentCrudRecord[]> {
  return findAll();
}

export async function listByStatus(
  status: LifecycleStatus
): Promise<AgentCrudRecord[]> {
  return (await findAll()).filter((record) => record.lifecycleStatus === status);
}

export async function getById(id: string): Promise<AgentCrudRecord | undefined> {
  return findById(id);
}

export async function search(term: string): Promise<AgentCrudRecord[]> {
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
      record.provider,
      record.model,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}
