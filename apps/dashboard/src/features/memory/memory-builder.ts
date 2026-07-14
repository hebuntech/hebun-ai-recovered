import { companyKnowledgeGraph } from "@/features/knowledge-graph/graph";
import type {
  KnowledgeGraphNode,
  KnowledgeGraphRelationship,
} from "@/features/knowledge-graph/types";
import type {
  ConversationMemoryRecord,
  DecisionMemoryRecord,
  MemoryImportance,
  MemoryRecord,
  MemoryStatus,
} from "@/features/memory/types";
import { registryRecords } from "@/features/registries/records";
import type { RegistryKey, RegistryRecord } from "@/features/registries/types";

const graphNodesByRegistryAndRecord = new Map<string, KnowledgeGraphNode>(
  companyKnowledgeGraph.nodes.map((node) => [
    `${node.registryType}:${node.metadata.sourceRecordId}`,
    node,
  ])
);

export function nodeForRecord(registryId: RegistryKey, recordId: string) {
  return graphNodesByRegistryAndRecord.get(`${registryId}:${recordId}`);
}

export function relationshipsForNode(nodeId: string) {
  return companyKnowledgeGraph.edges.filter(
    (edge) => edge.sourceId === nodeId || edge.targetId === nodeId
  );
}

export function edgeIdsForNode(nodeId: string, limit = 3) {
  return relationshipsForNode(nodeId)
    .slice(0, limit)
    .map((edge) => edge.id);
}

export function relatedNodeIds(
  registryIds: RegistryKey[],
  recordIds: string[]
) {
  return registryIds.flatMap((registryId) =>
    recordIds
      .map((recordId) => nodeForRecord(registryId, recordId)?.id)
      .filter((id): id is string => Boolean(id))
  );
}

export function relatedEdgeIds(nodeIds: string[], limit = 4) {
  const ids = new Set<string>();
  nodeIds.forEach((nodeId) => {
    relationshipsForNode(nodeId).forEach((edge) => {
      if (ids.size < limit) ids.add(edge.id);
    });
  });
  return Array.from(ids);
}

export function registryRecord(registryId: RegistryKey, index: number) {
  return registryRecords[registryId][index];
}

export function firstActiveRecord(registryId: RegistryKey) {
  return (
    registryRecords[registryId].find((record) => record.status === "active") ??
    registryRecords[registryId][0]
  );
}

export function importanceFromHealth(health: number): MemoryImportance {
  if (health <= 88) return "critical";
  if (health <= 92) return "high";
  if (health <= 96) return "medium";
  return "low";
}

export function statusFromHealth(health: number): MemoryStatus {
  if (health <= 88) return "review";
  if (health <= 94) return "fresh";
  return "stable";
}

export function deriveTimestamp(record: RegistryRecord, month: string, day: number) {
  const hour =
    record.updated === "just now" ? "17" : record.updated.includes("m ago") ? "15" : "11";
  return `${month}-${String(day).padStart(2, "0")}T${hour}:00:00.000Z`;
}

export function buildMemoryRecord(
  params: Omit<MemoryRecord, "graphRelationshipIds"> & {
    graphRelationshipIds?: string[];
  }
): MemoryRecord {
  return {
    ...params,
    graphRelationshipIds: params.graphRelationshipIds ?? relatedEdgeIds(params.graphNodeIds),
  };
}

export function buildDecisionMemory(
  params: Omit<DecisionMemoryRecord, "graphRelationshipIds"> & {
    graphRelationshipIds?: string[];
  }
): DecisionMemoryRecord {
  return {
    ...params,
    graphRelationshipIds: params.graphRelationshipIds ?? relatedEdgeIds(params.graphNodeIds),
  };
}

export function buildConversationMemory(
  params: Omit<ConversationMemoryRecord, "graphRelationshipIds"> & {
    graphRelationshipIds?: string[];
  }
): ConversationMemoryRecord {
  return {
    ...params,
    graphRelationshipIds: params.graphRelationshipIds ?? relatedEdgeIds(params.graphNodeIds),
  };
}

export function topRelationshipsByRegistry(
  registryId: RegistryKey,
  limit = 3
): KnowledgeGraphRelationship[] {
  return companyKnowledgeGraph.edges
    .filter(
      (edge) =>
        edge.metadata.sourceRegistry === registryId ||
        edge.metadata.targetRegistry === registryId
    )
    .slice(0, limit);
}
