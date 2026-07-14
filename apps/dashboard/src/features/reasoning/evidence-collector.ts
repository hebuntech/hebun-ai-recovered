import {
  companyKnowledgeGraph,
  graphEdgesByRegistry,
  graphNodesByRegistry,
} from "@/features/knowledge-graph";
import { companyMemories } from "@/features/memory";
import {
  healthInterpretationForRegistry,
  insightsForRegistry,
  recommendationsForRegistry,
  riskSignalsForRegistry,
} from "@/features/registries";
import type {
  ReasoningContext,
  ReasoningEvidence,
} from "@/features/reasoning/types";

export function collectEvidence(context: ReasoningContext): ReasoningEvidence[] {
  const evidence: ReasoningEvidence[] = [];

  context.registries.forEach((registry) => {
    const registryNodeIds = graphNodesByRegistry(registry.id)
      .slice(0, 3)
      .map((node) => node.id);
    const memoryIds = companyMemories
      .filter((memory) => memory.registryIds.includes(registry.id))
      .slice(0, 3)
      .map((memory) => memory.id);

    evidence.push({
      id: `ev-reg-${registry.id}`,
      sourceType: "registry",
      title: `${registry.title} state`,
      detail: `${registry.title} health is ${registry.health} with ${registry.dailyGrowth}/day growth and ${registry.recentChanges} recent changes.`,
      weight: registry.health >= 95 ? 75 : registry.health >= 92 ? 84 : 92,
      registryIds: [registry.id],
      graphNodeIds: registryNodeIds,
      memoryIds,
    });

    const interpretation = healthInterpretationForRegistry(registry.id);
    if (interpretation) {
      evidence.push({
        id: `ev-int-${registry.id}`,
        sourceType: "intelligence",
        title: `${registry.shortLabel} interpretation`,
        detail: interpretation.summary,
        weight: interpretation.attention === "critical" ? 92 : interpretation.attention === "watch" ? 80 : 68,
        registryIds: [registry.id],
        graphNodeIds: registryNodeIds,
        memoryIds,
      });
    }

    const riskSignal = riskSignalsForRegistry(registry.id)[0];
    if (riskSignal) {
      evidence.push({
        id: `ev-risk-${registry.id}`,
        sourceType: "intelligence",
        title: riskSignal.title,
        detail: riskSignal.detail,
        weight: riskSignal.severity === "error" ? 96 : 86,
        registryIds: riskSignal.registryIds,
        graphNodeIds: registryNodeIds,
        memoryIds,
      });
    }

    const recommendation = recommendationsForRegistry(registry.id)[0];
    if (recommendation) {
      evidence.push({
        id: `ev-rec-${registry.id}`,
        sourceType: "intelligence",
        title: recommendation.title,
        detail: recommendation.detail,
        weight: recommendation.priority === "critical" ? 95 : recommendation.priority === "high" ? 84 : 72,
        registryIds: recommendation.registryIds,
        graphNodeIds: registryNodeIds,
        memoryIds,
      });
    }

    const insight = insightsForRegistry(registry.id)[0];
    if (insight) {
      evidence.push({
        id: `ev-ins-${registry.id}`,
        sourceType: "intelligence",
        title: insight.title,
        detail: insight.detail,
        weight: insight.priority === "high" ? 83 : insight.priority === "medium" ? 74 : 62,
        registryIds: insight.registryIds,
        graphNodeIds: registryNodeIds,
        memoryIds,
      });
    }
  });

  const relevantMemories = companyMemories
    .filter((memory) =>
      memory.registryIds.some((registryId) => context.registryIds.includes(registryId))
    )
    .slice(0, 5);

  relevantMemories.forEach((memory) => {
    evidence.push({
      id: `ev-mem-${memory.id}`,
      sourceType: "memory",
      title: memory.title,
      detail: memory.summary,
      weight: memory.importance === "critical" ? 92 : memory.importance === "high" ? 84 : 72,
      registryIds: memory.registryIds,
      graphNodeIds: memory.graphNodeIds,
      memoryIds: [memory.id],
    });
  });

  const relatedGraphLinks = context.registryIds.flatMap((registryId) =>
    graphEdgesByRegistry(registryId).slice(0, 2)
  );

  if (relatedGraphLinks.length) {
    evidence.push({
      id: `ev-graph-${context.scenarioId}`,
      sourceType: "graph",
      title: "Knowledge graph relationship coverage",
      detail: `${relatedGraphLinks.length} typed graph links connect the focused registries, preserving structural traceability for the recommendation.`,
      weight: 78,
      registryIds: context.registryIds,
      graphNodeIds: relatedGraphLinks.flatMap((edge) => [edge.sourceId, edge.targetId]).slice(0, 6),
      memoryIds: [],
    });
  }

  if (!companyKnowledgeGraph.edges.length) return evidence;
  return evidence;
}
