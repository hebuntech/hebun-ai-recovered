/*
 * Registry CRUD — queries (read side).
 */

import { findAll, findById } from "./registry-repository";
import type { LifecycleStatus, RegistryCrudRecord } from "./types";

export async function listAll(): Promise<RegistryCrudRecord[]> {
  return findAll();
}

export async function listByStatus(
  status: LifecycleStatus
): Promise<RegistryCrudRecord[]> {
  return (await findAll()).filter((r) => r.lifecycleStatus === status);
}

export async function getById(id: string): Promise<RegistryCrudRecord | undefined> {
  return findById(id);
}

export async function search(term: string): Promise<RegistryCrudRecord[]> {
  const q = term.trim().toLowerCase();
  const records = await findAll();
  if (!q) return records;
  return records.filter(
    (r) => r.title.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
  );
}
