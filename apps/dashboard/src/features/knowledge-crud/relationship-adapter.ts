/*
 * Knowledge CRUD — relationship persistence adapter binding.
 *
 * Seeds the knowledge-relationships collection from the derived graph edges.
 */

import { getAdapter } from "@/features/persistence";
import { knowledgeGraphEdges } from "@/features/knowledge-graph/edges";
import type { RelationshipRecord } from "./types";

const SEED_AT = "2026-01-01T00:00:00.000Z";

function seed(): RelationshipRecord[] {
  return knowledgeGraphEdges.map((edge) => ({
    id: edge.id,
    sourceNode: edge.sourceId,
    targetNode: edge.targetId,
    relationshipType: edge.relationshipType,
    weight: edge.strength,
    createdAt: SEED_AT,
    updatedAt: SEED_AT,
    createdBy: "Seed",
    updatedBy: "Seed",
    lifecycleStatus: "active",
  }));
}

export const relationshipAdapter = getAdapter<RelationshipRecord>("knowledge-relationships", seed);

export const subscribeRelationships = relationshipAdapter.subscribe;
export const getRelationshipSnapshot = relationshipAdapter.getSnapshot;

export function resetRelationshipStore(): void {
  relationshipAdapter.save(seed());
}
