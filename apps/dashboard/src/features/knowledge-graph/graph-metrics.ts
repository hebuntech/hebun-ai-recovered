import { companyKnowledgeGraph } from "@/features/knowledge-graph/graph";
import type {
  KnowledgeGraphHealthSummary,
  KnowledgeGraphMetrics,
  KnowledgeGraphRegistryMetric,
  KnowledgeGraphRelationshipDistribution,
  KnowledgeGraphRelationshipType,
} from "@/features/knowledge-graph/types";
import type { RegistryKey } from "@/features/registries/types";

function connectedComponents(): number {
  const adjacency = new Map<string, Set<string>>();
  for (const node of companyKnowledgeGraph.nodes) adjacency.set(node.id, new Set());
  for (const edge of companyKnowledgeGraph.edges) {
    adjacency.get(edge.sourceId)?.add(edge.targetId);
    adjacency.get(edge.targetId)?.add(edge.sourceId);
  }

  const visited = new Set<string>();
  let components = 0;
  for (const node of companyKnowledgeGraph.nodes) {
    if (visited.has(node.id)) continue;
    components += 1;
    const pending = [node.id];
    while (pending.length > 0) {
      const current = pending.pop();
      if (!current || visited.has(current)) continue;
      visited.add(current);
      for (const neighbor of adjacency.get(current) ?? []) {
        if (!visited.has(neighbor)) pending.push(neighbor);
      }
    }
  }
  return components;
}

function registryMetrics(): KnowledgeGraphRegistryMetric[] {
  const registryTypes = new Set(
    companyKnowledgeGraph.nodes.map((node) => node.registryType)
  );

  return [...registryTypes]
    .map((registryType) => {
      const nodes = companyKnowledgeGraph.nodes.filter(
        (node) => node.registryType === registryType
      );
      const nodeIds = new Set(nodes.map((node) => node.id));
      const relationshipCount = companyKnowledgeGraph.edges.filter(
        (edge) => nodeIds.has(edge.sourceId) || nodeIds.has(edge.targetId)
      ).length;
      const averageHealth = Math.round(
        nodes.reduce((sum, node) => sum + node.metadata.health, 0) /
          Math.max(nodes.length, 1)
      );

      return {
        registryType: registryType as RegistryKey,
        nodeCount: nodes.length,
        relationshipCount,
        averageHealth,
      };
    })
    .sort(
      (a, b) =>
        b.relationshipCount - a.relationshipCount ||
        a.registryType.localeCompare(b.registryType)
    );
}

function relationshipDistribution(): KnowledgeGraphRelationshipDistribution[] {
  const counts = new Map<KnowledgeGraphRelationshipType, number>();
  for (const edge of companyKnowledgeGraph.edges) {
    counts.set(edge.relationshipType, (counts.get(edge.relationshipType) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([relationshipType, count]) => ({ relationshipType, count }))
    .sort((a, b) => b.count - a.count || a.relationshipType.localeCompare(b.relationshipType));
}

function healthSummary(components: number): KnowledgeGraphHealthSummary {
  const nodes = companyKnowledgeGraph.nodes;
  const edges = companyKnowledgeGraph.edges;
  const connectedNodeIds = new Set(edges.flatMap((edge) => [edge.sourceId, edge.targetId]));
  const coverage = Math.round((connectedNodeIds.size / Math.max(nodes.length, 1)) * 100);
  const confidence = Math.round(
    edges.reduce((sum, edge) => sum + edge.confidence, 0) / Math.max(edges.length, 1)
  );
  const nodeHealth = Math.round(
    nodes.reduce((sum, node) => sum + node.metadata.health, 0) / Math.max(nodes.length, 1)
  );
  const componentPenalty = Math.max(0, components - 1) * 2;
  const score = Math.max(
    0,
    Math.min(100, Math.round(coverage * 0.4 + confidence * 0.3 + nodeHealth * 0.3 - componentPenalty))
  );
  const status = score >= 90 ? "healthy" : score >= 80 ? "watch" : "critical";

  return {
    score,
    status,
    badge: status === "healthy" ? "success" : status === "watch" ? "warning" : "error",
    summary:
      status === "healthy"
        ? "The company graph has strong relationship coverage and confidence."
        : status === "watch"
          ? "The graph is usable, with some connectivity gaps requiring review."
          : "The graph needs stronger relationship coverage before broad operational reuse.",
    signals: [
      `${coverage}% of nodes participate in at least one relationship`,
      `${confidence}% average relationship confidence`,
      `${nodeHealth}% average registry-node health`,
      `${components} connected graph component${components === 1 ? "" : "s"}`,
    ],
  };
}

const components = connectedComponents();
const summary = healthSummary(components);

export const knowledgeGraphMetrics: KnowledgeGraphMetrics = {
  totalNodes: companyKnowledgeGraph.nodes.length,
  totalRelationships: companyKnowledgeGraph.edges.length,
  connectedComponents: components,
  graphHealth: summary.score,
  mostConnectedRegistries: registryMetrics().slice(0, 6),
  relationshipDistribution: relationshipDistribution(),
  healthSummary: summary,
};
