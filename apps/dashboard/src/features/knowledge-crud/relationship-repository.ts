/* Knowledge CRUD — relationship repository. */
import { createRepository } from "@/features/persistence";
import { relationshipAdapter } from "./relationship-adapter";
import type { RelationshipRecord } from "./types";

const repository = createRepository(relationshipAdapter);

export async function findAll(): Promise<RelationshipRecord[]> {
  return repository.findAll();
}
export async function findById(
  id: string
): Promise<RelationshipRecord | undefined> {
  return repository.findById(id);
}
export async function insert(record: RelationshipRecord): Promise<void> {
  await repository.insert(record);
}
export async function update(
  id: string,
  patch: Partial<RelationshipRecord>
): Promise<RelationshipRecord | undefined> {
  return repository.update(id, { ...patch, updatedAt: new Date().toISOString() });
}
export async function softDelete(
  id: string
): Promise<RelationshipRecord | undefined> {
  return repository.softDelete(id);
}
