/*
 * Memory CRUD — repository.
 */

import { createRepository } from "@/features/persistence";
import type { LifecycleStatus } from "@/features/persistence";
import { memoryAdapter } from "./memory-adapter";
import type { MemoryCrudRecord } from "./types";

const repository = createRepository(memoryAdapter);

export async function findAll(): Promise<MemoryCrudRecord[]> {
  return repository.findAll();
}

export async function findById(id: string): Promise<MemoryCrudRecord | undefined> {
  return repository.findById(id);
}

export async function insert(record: MemoryCrudRecord): Promise<void> {
  await repository.insert(record);
}

export async function update(
  id: string,
  patch: Partial<MemoryCrudRecord>
): Promise<MemoryCrudRecord | undefined> {
  return repository.update(id, { ...patch, updatedAt: new Date().toISOString() });
}

export async function setStatus(
  id: string,
  status: LifecycleStatus
): Promise<MemoryCrudRecord | undefined> {
  if (status === "archived") return repository.archive(id);
  if (status === "active") return repository.restore(id);
  return repository.softDelete(id);
}
