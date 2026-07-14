/*
 * Memory CRUD — queries.
 */

import type { LifecycleStatus } from "@/features/persistence";
import { findAll, findById } from "./memory-repository";
import type { MemoryCrudRecord } from "./types";

export async function listAll(): Promise<MemoryCrudRecord[]> {
  return findAll();
}

export async function listByStatus(
  status: LifecycleStatus
): Promise<MemoryCrudRecord[]> {
  return (await findAll()).filter((record) => record.lifecycleStatus === status);
}

export async function getById(id: string): Promise<MemoryCrudRecord | undefined> {
  return findById(id);
}

export async function search(term: string): Promise<MemoryCrudRecord[]> {
  const query = term.trim().toLowerCase();
  const records = await findAll();
  if (!query) return records;
  return records.filter((record) => {
    const haystack = [
      record.id,
      record.title,
      record.slug,
      record.description,
      record.memoryType,
      record.ownerType,
      record.ownerId,
      record.source,
      record.summary,
      record.tags.join(" "),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}
