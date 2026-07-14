/*
 * Memory Engine — reporting.
 *
 * Derives retrieval statistics and the compact dashboard report from an already
 * assembled context package. Pure math over the selected set; the only
 * non-deterministic value is retrievalTimeMs, a measured stat that never feeds
 * back into selection or ordering.
 */

import { IMPORTANCE_SCORE } from "./memory-ranking";
import type {
  LinkedKnowledgeNode,
  LinkedRelationship,
  MemoryContextPackage,
  MemoryEngineReport,
  RankedMemory,
  RelatedMemory,
  RetrievalStatistics,
} from "./types";

export interface StatisticsInput {
  candidateCount: number;
  selected: RankedMemory[];
  nodes: LinkedKnowledgeNode[];
  relationships: LinkedRelationship[];
  related: RelatedMemory[];
  coveredMemories: number;
  retrievalTimeMs: number;
}

export function buildStatistics(input: StatisticsInput): RetrievalStatistics {
  const n = input.selected.length;
  let sumConfidence = 0;
  let sumImportance = 0;
  for (const { record } of input.selected) {
    sumConfidence += record.confidence;
    sumImportance += IMPORTANCE_SCORE[record.importance];
  }

  return {
    candidateCount: input.candidateCount,
    retrievedCount: n,
    knowledgeNodeCount: input.nodes.length,
    relationshipCount: input.relationships.length,
    relatedMemoryCount: input.related.length,
    averageConfidence: n === 0 ? 0 : round(sumConfidence / n),
    averageImportance: n === 0 ? 0 : round(sumImportance / n),
    knowledgeCoverage: n === 0 ? 0 : round(input.coveredMemories / n),
    retrievalTimeMs: round(input.retrievalTimeMs),
  };
}

/** The compact report is a projection of the package statistics. */
export function buildReport(pkg: MemoryContextPackage): MemoryEngineReport {
  const stats = pkg.statistics;
  return {
    retrievedCount: stats.retrievedCount,
    averageConfidence: stats.averageConfidence,
    averageImportance: stats.averageImportance,
    knowledgeCoverage: stats.knowledgeCoverage,
    relationshipCount: stats.relationshipCount,
    retrievalTimeMs: stats.retrievalTimeMs,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
