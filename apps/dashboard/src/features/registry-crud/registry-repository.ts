/*
 * Registry CRUD — repository.
 *
 * Delegates entirely to the persistence adapter. No direct store access, no
 * knowledge of the storage provider. Swapping the backend (memory → Supabase →
 * Postgres) never touches this file.
 */

import { createRepository } from "@/features/persistence";
import { registryAdapter } from "./registry-adapter";
import type { LifecycleStatus, RegistryCrudRecord } from "./types";

const repository = createRepository(registryAdapter);

export async function findAll(): Promise<RegistryCrudRecord[]> {
  return repository.findAll();
}

export async function findById(id: string): Promise<RegistryCrudRecord | undefined> {
  return repository.findById(id);
}

export async function insert(record: RegistryCrudRecord): Promise<void> {
  await repository.insert(record);
}

export async function update(
  id: string,
  patch: Partial<RegistryCrudRecord>
): Promise<RegistryCrudRecord | undefined> {
  return repository.update(id, { ...patch, updatedAt: new Date().toISOString() });
}

export async function setStatus(
  id: string,
  status: LifecycleStatus
): Promise<RegistryCrudRecord | undefined> {
  if (status === "archived") return repository.archive(id);
  if (status === "active") return repository.restore(id);
  return repository.softDelete(id);
}
