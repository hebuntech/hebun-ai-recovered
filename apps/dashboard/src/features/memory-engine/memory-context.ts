/*
 * Memory Engine — context assembly + knowledge linking.
 *
 * Resolves the deterministic chain:
 *   Memory → Knowledge Nodes → Relationships → Related Memories
 * using only the Knowledge Graph CRUD data already in the index. No traversal
 * heuristics beyond explicit owner / tag / slug bridges; every step is stable
 * and re-derivable.
 */

import type { MemoryCrudRecord, MemoryImportance } from "@/features/memory-crud";
import { IMPORTANCE_SCORE } from "./memory-ranking";
import { normalizeTag } from "./memory-index";
import type { MemoryEngineIndex } from "./memory-index";
import type {
  ConfidenceSummary,
  KnowledgeLinkReason,
  LinkedKnowledgeNode,
  LinkedRelationship,
  RankedMemory,
  RelatedMemory,
} from "./types";

interface KnowledgeLinkResult {
  nodes: LinkedKnowledgeNode[];
  relationships: LinkedRelationship[];
  related: RelatedMemory[];
  /** Count of selected memories that linked to at least one node. */
  coveredMemories: number;
}

const REASON_ORDER: Record<KnowledgeLinkReason, number> = {
  owner: 0,
  tag: 1,
  slug: 2,
};

/** Resolve knowledge nodes reachable from one memory, tagged with the reason. */
function nodesForMemory(
  memory: MemoryCrudRecord,
  index: MemoryEngineIndex
): Map<string, Set<KnowledgeLinkReason>> {
  const reached = new Map<string, Set<KnowledgeLinkReason>>();
  const add = (nodeId: string, reason: KnowledgeLinkReason) => {
    const bucket = reached.get(nodeId);
    if (bucket) bucket.add(reason);
    else reached.set(nodeId, new Set([reason]));
  };

  for (const node of index.nodesByOwner.get(memory.ownerId) ?? []) {
    if (node.lifecycleStatus === "active") add(node.id, "owner");
  }
  for (const tag of memory.tags) {
    for (const node of index.nodesByTag.get(normalizeTag(tag)) ?? []) {
      if (node.lifecycleStatus === "active") add(node.id, "tag");
    }
  }
  for (const node of index.nodes) {
    if (node.lifecycleStatus === "active" && node.slug === memory.slug) {
      add(node.id, "slug");
    }
  }

  return reached;
}

/**
 * Build the full knowledge linkage for the selected memory set. Output ordering
 * is fixed (ids ascending) so the same input yields the same package.
 */
export function linkKnowledge(
  selected: RankedMemory[],
  index: MemoryEngineIndex
): KnowledgeLinkResult {
  const selectedIds = new Set(selected.map((entry) => entry.record.id));

  // Memory → Knowledge Nodes.
  const nodeReasons = new Map<string, Set<KnowledgeLinkReason>>();
  let coveredMemories = 0;
  for (const entry of selected) {
    const reached = nodesForMemory(entry.record, index);
    if (reached.size > 0) coveredMemories += 1;
    for (const [nodeId, reasons] of reached) {
      const bucket = nodeReasons.get(nodeId);
      if (bucket) for (const reason of reasons) bucket.add(reason);
      else nodeReasons.set(nodeId, new Set(reasons));
    }
  }

  const nodes: LinkedKnowledgeNode[] = [];
  for (const [nodeId, reasons] of nodeReasons) {
    const node = index.nodeById.get(nodeId);
    if (!node) continue;
    nodes.push({
      node,
      via: [...reasons].sort((a, b) => REASON_ORDER[a] - REASON_ORDER[b]),
    });
  }
  nodes.sort((a, b) => cmp(a.node.id, b.node.id));

  // Knowledge Nodes → Relationships.
  const linkedNodeIds = new Set(nodes.map((entry) => entry.node.id));
  const relationshipsById = new Map<string, LinkedRelationship>();
  for (const nodeId of linkedNodeIds) {
    for (const relationship of index.relationshipsByNode.get(nodeId) ?? []) {
      if (relationshipsById.has(relationship.id)) continue;
      const neighborNode =
        relationship.sourceNode === nodeId
          ? relationship.targetNode
          : relationship.sourceNode;
      relationshipsById.set(relationship.id, {
        relationship,
        anchorNode: nodeId,
        neighborNode,
      });
    }
  }
  const relationships = [...relationshipsById.values()].sort((a, b) =>
    cmp(a.relationship.id, b.relationship.id)
  );

  // Relationships → Related Memories (through neighbour nodes).
  const neighborIds = new Set<string>();
  for (const link of relationships) {
    if (!linkedNodeIds.has(link.neighborNode)) neighborIds.add(link.neighborNode);
  }

  const relatedVia = new Map<string, Set<string>>();
  const addRelated = (memoryId: string, nodeId: string) => {
    const bucket = relatedVia.get(memoryId);
    if (bucket) bucket.add(nodeId);
    else relatedVia.set(memoryId, new Set([nodeId]));
  };

  const memoryById = new Map(index.memories.map((memory) => [memory.id, memory]));
  for (const nodeId of neighborIds) {
    const node = index.nodeById.get(nodeId);
    if (!node) continue;
    for (const memory of index.memoriesByOwner.get(node.ownerId) ?? []) {
      if (memory.lifecycleStatus !== "active") continue;
      if (selectedIds.has(memory.id)) continue;
      addRelated(memory.id, nodeId);
    }
    for (const memory of index.memories) {
      if (memory.slug === node.slug && !selectedIds.has(memory.id) && memory.lifecycleStatus === "active") {
        addRelated(memory.id, nodeId);
      }
    }
  }

  const related: RelatedMemory[] = [];
  for (const [memoryId, viaNodes] of relatedVia) {
    const record = memoryById.get(memoryId);
    if (!record) continue;
    related.push({ record, viaNodes: [...viaNodes].sort(cmp) });
  }
  related.sort((a, b) => cmp(a.record.id, b.record.id));

  return { nodes, relationships, related, coveredMemories };
}

/** Confidence + importance rollup over the selected memory records. */
export function summarizeConfidence(selected: RankedMemory[]): ConfidenceSummary {
  const breakdown: Record<MemoryImportance, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  if (selected.length === 0) {
    return {
      averageConfidence: 0,
      minConfidence: 0,
      maxConfidence: 0,
      averageImportanceScore: 0,
      importanceBreakdown: breakdown,
    };
  }

  let sumConfidence = 0;
  let minConfidence = Infinity;
  let maxConfidence = -Infinity;
  let sumImportance = 0;

  for (const { record } of selected) {
    sumConfidence += record.confidence;
    if (record.confidence < minConfidence) minConfidence = record.confidence;
    if (record.confidence > maxConfidence) maxConfidence = record.confidence;
    sumImportance += IMPORTANCE_SCORE[record.importance];
    breakdown[record.importance] += 1;
  }

  const n = selected.length;
  return {
    averageConfidence: round(sumConfidence / n),
    minConfidence,
    maxConfidence,
    averageImportanceScore: round(sumImportance / n),
    importanceBreakdown: breakdown,
  };
}

function cmp(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
