/* Knowledge CRUD — relationship queries. */
import { findAll, findById } from "./relationship-repository";
import type { RelationshipRecord } from "./types";

export async function listRelationships(): Promise<RelationshipRecord[]> {
  return findAll();
}
export async function getRelationshipById(
  id: string
): Promise<RelationshipRecord | undefined> {
  return findById(id);
}
export async function relationshipsForNode(
  nodeId: string
): Promise<RelationshipRecord[]> {
  return (await findAll()).filter(
    (record) => record.sourceNode === nodeId || record.targetNode === nodeId
  );
}
