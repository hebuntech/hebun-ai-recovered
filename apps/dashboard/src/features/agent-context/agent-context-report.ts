/*
 * Agent Context — report + context health.
 *
 * Derives the compact report from a Memory Engine Context Package. Context
 * Health is a deterministic 0-100 blend of retrieval confidence, knowledge
 * coverage, and how full the result set is relative to the requested limit.
 */

import type { MemoryContextPackage } from "@/features/memory-engine";
import type {
  AgentContextReport,
  ContextHealthLabel,
} from "./types";

const HEALTH_WEIGHTS = {
  confidence: 0.5,
  coverage: 0.3,
  fill: 0.2,
} as const;

function fillRatio(pkg: MemoryContextPackage): number {
  const limit = pkg.summary.requestedLimit;
  if (limit <= 0) return 0;
  return Math.min(pkg.statistics.retrievedCount / limit, 1);
}

function healthLabel(score: number, retrieved: number): ContextHealthLabel {
  if (retrieved === 0) return "empty";
  if (score >= 75) return "strong";
  if (score >= 50) return "moderate";
  return "weak";
}

/** Build the agent-facing report from an engine Context Package. */
export function buildContextReport(pkg: MemoryContextPackage): AgentContextReport {
  const stats = pkg.statistics;

  const confidenceComponent = stats.averageConfidence * HEALTH_WEIGHTS.confidence;
  const coverageComponent = stats.knowledgeCoverage * 100 * HEALTH_WEIGHTS.coverage;
  const fillComponent = fillRatio(pkg) * 100 * HEALTH_WEIGHTS.fill;
  const contextHealth = round(
    confidenceComponent + coverageComponent + fillComponent
  );

  return {
    retrievedMemories: stats.retrievedCount,
    knowledgeNodes: stats.knowledgeNodeCount,
    relationships: stats.relationshipCount,
    relatedMemories: stats.relatedMemoryCount,
    averageConfidence: stats.averageConfidence,
    averageImportance: stats.averageImportance,
    knowledgeCoverage: stats.knowledgeCoverage,
    contextHealth,
    contextHealthLabel: healthLabel(contextHealth, stats.retrievedCount),
    retrievalTimeMs: stats.retrievalTimeMs,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
