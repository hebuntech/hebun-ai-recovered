/* Knowledge CRUD — node repository (delegates to the persistence adapter). */
import { createRepository } from "@/features/persistence";
import type { LifecycleStatus } from "@/features/persistence";
import { knowledgeNodeAdapter } from "./node-adapter";
import type { KnowledgeNodeRecord } from "./types";

const repository = createRepository(knowledgeNodeAdapter);

export async function findAll(): Promise<KnowledgeNodeRecord[]> {
  return repository.findAll();
}
export async function findById(
  id: string
): Promise<KnowledgeNodeRecord | undefined> {
  return repository.findById(id);
}
export async function insert(record: KnowledgeNodeRecord): Promise<void> {
  await repository.insert(record);
}
export async function update(
  id: string,
  patch: Partial<KnowledgeNodeRecord>
): Promise<KnowledgeNodeRecord | undefined> {
  return repository.update(id, { ...patch, updatedAt: new Date().toISOString() });
}
export async function setStatus(
  id: string,
  status: LifecycleStatus
): Promise<KnowledgeNodeRecord | undefined> {
  if (status === "archived") return repository.archive(id);
  if (status === "active") return repository.restore(id);
  return repository.softDelete(id);
}
