import { companyMemories, memoryTypeDefinitions } from "@/features/memory/memory";
import {
  recentConversationMemories,
  recentDecisionMemories,
  recentLearningMemories,
  recentProceduralMemories,
} from "@/features/memory/memory-queries";
import type { MemoryHealthSummary, MemoryMetrics } from "@/features/memory/types";

function healthSummary(): MemoryHealthSummary {
  const total = companyMemories.length;
  const referenceCoverage = Math.round(
    (companyMemories.filter(
      (memory) =>
        memory.registryIds.length > 0 &&
        memory.graphNodeIds.length > 0 &&
        memory.graphRelationshipIds.length > 0
    ).length /
      total) *
      100
  );
  const reviewRate = Math.round(
    (companyMemories.filter((memory) => memory.status === "review").length / total) * 100
  );
  const criticalRate = Math.round(
    (companyMemories.filter((memory) => memory.importance === "critical").length / total) * 100
  );

  const score = Math.round(referenceCoverage * 0.5 + (100 - reviewRate) * 0.3 + (100 - criticalRate) * 0.2);
  const status = score >= 92 ? "healthy" : score >= 86 ? "watch" : "critical";
  const badge = status === "healthy" ? "success" : status === "watch" ? "warning" : "error";

  return {
    score,
    badge,
    status,
    summary:
      status === "healthy"
        ? "The company memory layer has strong reference integrity and is ready to anchor future planning and reasoning systems."
        : status === "watch"
          ? "The memory layer is usable, but some memories still need stronger review discipline or richer graph references."
          : "The memory layer exists, but too much important memory remains under-reviewed or weakly connected to the company model.",
    signals: [
      `${referenceCoverage}% of memories link registries, graph nodes, and graph relationships`,
      `${reviewRate}% of memories need review attention`,
      `${criticalRate}% of memories are critical importance`,
      `${total} computed memory assets are currently available`,
    ],
  };
}

const summary = healthSummary();

export const memoryMetrics: MemoryMetrics = {
  totalMemories: companyMemories.length,
  decisionMemories: companyMemories.filter((memory) => memory.category === "decision")
    .length,
  learningMemories: companyMemories.filter((memory) => memory.category === "learning")
    .length,
  procedures: companyMemories.filter((memory) => memory.category === "procedural").length,
  healthScore: summary.score,
  timelineItems: companyMemories.length,
  categoryDistribution: memoryTypeDefinitions.map((type) => ({
    category: type.id,
    label: type.label,
    count: companyMemories.filter((memory) => memory.category === type.id).length,
  })),
  recentDecisions: recentDecisionMemories(),
  recentLearnings: recentLearningMemories(),
  proceduralAssets: recentProceduralMemories(),
  conversationSummaries: recentConversationMemories(),
  health: summary,
};
