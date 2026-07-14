/*
 * Memory Engine — deterministic index.
 *
 * Builds read-only lookup structures over the current Memory CRUD and Knowledge
 * CRUD snapshots. Pure derivation: given the same snapshots, the same index.
 * The engine never mutates any store; it only reads through the CRUD facades.
 */

import { getSnapshot as getMemorySnapshot } from "@/features/memory-crud";
import {
  getNodeSnapshot,
  getRelationshipSnapshot,
} from "@/features/knowledge-crud";
import type { MemoryCrudRecord } from "@/features/memory-crud";
import type {
  KnowledgeNodeRecord,
  RelationshipRecord,
} from "@/features/knowledge-crud";

export interface MemoryEngineIndex {
  memories: MemoryCrudRecord[];
  nodes: KnowledgeNodeRecord[];
  relationships: RelationshipRecord[];
  /** ownerType:ownerId → memory records. */
  memoriesByOwner: Map<string, MemoryCrudRecord[]>;
  /** ownerId → knowledge nodes (nodes are organization-owned). */
  nodesByOwner: Map<string, KnowledgeNodeRecord[]>;
  /** normalised tag → knowledge nodes carrying it. */
  nodesByTag: Map<string, KnowledgeNodeRecord[]>;
  /** node id → relationships touching that node. */
  relationshipsByNode: Map<string, RelationshipRecord[]>;
  /** node id → node record. */
  nodeById: Map<string, KnowledgeNodeRecord>;
}

export function ownerKey(ownerType: string, ownerId: string): string {
  return `${ownerType}:${ownerId}`;
}

export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

function push<T>(map: Map<string, T[]>, key: string, value: T): void {
  const bucket = map.get(key);
  if (bucket) bucket.push(value);
  else map.set(key, [value]);
}

/**
 * Build the engine index from the live CRUD snapshots. Records are read in the
 * store's own order and never re-sorted here; ranking owns ordering later.
 */
export function buildIndex(): MemoryEngineIndex {
  const memories = getMemorySnapshot();
  const nodes = getNodeSnapshot();
  const relationships = getRelationshipSnapshot();

  const memoriesByOwner = new Map<string, MemoryCrudRecord[]>();
  for (const memory of memories) {
    push(memoriesByOwner, ownerKey(memory.ownerType, memory.ownerId), memory);
  }

  const nodesByOwner = new Map<string, KnowledgeNodeRecord[]>();
  const nodesByTag = new Map<string, KnowledgeNodeRecord[]>();
  const nodeById = new Map<string, KnowledgeNodeRecord>();
  for (const node of nodes) {
    nodeById.set(node.id, node);
    push(nodesByOwner, node.ownerId, node);
    for (const tag of node.tags) {
      push(nodesByTag, normalizeTag(tag), node);
    }
  }

  const relationshipsByNode = new Map<string, RelationshipRecord[]>();
  for (const relationship of relationships) {
    if (relationship.lifecycleStatus !== "active") continue;
    push(relationshipsByNode, relationship.sourceNode, relationship);
    push(relationshipsByNode, relationship.targetNode, relationship);
  }

  return {
    memories,
    nodes,
    relationships,
    memoriesByOwner,
    nodesByOwner,
    nodesByTag,
    relationshipsByNode,
    nodeById,
  };
}
