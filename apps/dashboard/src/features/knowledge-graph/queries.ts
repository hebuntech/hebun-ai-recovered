import { companyKnowledgeGraph } from "@/features/knowledge-graph/graph";
import { registryRecords } from "@/features/registries/records";
import type {
  KnowledgeGraphNode,
  KnowledgeGraphQueryResult,
  KnowledgeGraphRegistryType,
  KnowledgeGraphRelationship,
  KnowledgeGraphRelationshipType,
} from "@/features/knowledge-graph/types";

export function graphNodesByRegistry(
  registryType: KnowledgeGraphRegistryType
): KnowledgeGraphNode[] {
  return companyKnowledgeGraph.nodes.filter((node) => node.registryType === registryType);
}

export function graphEdgesByRegistry(
  registryType: KnowledgeGraphRegistryType
): KnowledgeGraphRelationship[] {
  const nodeIds = new Set(graphNodesByRegistry(registryType).map((node) => node.id));
  return companyKnowledgeGraph.edges.filter(
    (edge) => nodeIds.has(edge.sourceId) || nodeIds.has(edge.targetId)
  );
}

export function graphEdgesByType(
  relationshipType: KnowledgeGraphRelationshipType
): KnowledgeGraphRelationship[] {
  return companyKnowledgeGraph.edges.filter(
    (edge) => edge.relationshipType === relationshipType
  );
}

export function graphNeighborhood(nodeId: string) {
  const node = companyKnowledgeGraph.nodes.find((item) => item.id === nodeId);
  const edges = companyKnowledgeGraph.edges.filter(
    (edge) => edge.sourceId === nodeId || edge.targetId === nodeId
  );
  const neighborIds = new Set(
    edges.map((edge) => (edge.sourceId === nodeId ? edge.targetId : edge.sourceId))
  );
  const neighbors = companyKnowledgeGraph.nodes.filter((candidate) =>
    neighborIds.has(candidate.id)
  );

  return { node, edges, neighbors };
}

export function graphRegistryRecords(
  registryType: KnowledgeGraphRegistryType
): KnowledgeGraphQueryResult {
  return {
    registryType,
    records: registryRecords[registryType],
  };
}
