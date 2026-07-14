/* Knowledge CRUD — node queries. */
import type { LifecycleStatus } from "@/features/persistence";
import { findAll, findById } from "./node-repository";
import type { KnowledgeNodeRecord } from "./types";

export async function listNodes(): Promise<KnowledgeNodeRecord[]> {
  return findAll();
}
export async function listNodesByStatus(
  status: LifecycleStatus
): Promise<KnowledgeNodeRecord[]> {
  return (await findAll()).filter((record) => record.lifecycleStatus === status);
}
export async function getNodeById(
  id: string
): Promise<KnowledgeNodeRecord | undefined> {
  return findById(id);
}
export async function searchNodes(term: string): Promise<KnowledgeNodeRecord[]> {
  const query = term.trim().toLowerCase();
  const records = await findAll();
  if (!query) return records;
  return records.filter((record) =>
    [record.id, record.title, record.slug, record.description, record.nodeType, record.ownerId, record.source, record.tags.join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(query)
  );
}
