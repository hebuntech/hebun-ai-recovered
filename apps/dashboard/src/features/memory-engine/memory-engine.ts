/*
 * Memory Engine — orchestrator.
 *
 * The single public entry point. Given a retrieval request it builds the index,
 * selects and ranks memories, links the knowledge graph, and assembles the
 * Context Package + report. No LLM, no embeddings, no vector search, no network.
 *
 * Determinism contract: the retrieved memories, their order, the linked
 * knowledge nodes, relationships, and related memories are a pure function of
 * the current CRUD snapshots and the request. `retrievalTimeMs` and
 * `generatedAt` are observational metadata only — they never influence
 * selection or ordering.
 */

import { resolveCriteria } from "./memory-filters";
import { buildIndex } from "./memory-index";
import { selectMemories } from "./memory-selector";
import { linkKnowledge, summarizeConfidence } from "./memory-context";
import { buildReport, buildStatistics } from "./memory-report";
import type {
  ContextSummaryMetadata,
  MemoryContextPackage,
  MemoryEngineReport,
  MemoryRetrievalRequest,
} from "./types";

function now(): number {
  const perf = (globalThis as { performance?: { now(): number } }).performance;
  return perf ? perf.now() : Date.now();
}

/**
 * Retrieve the most relevant memories for a request and return a full Context
 * Package. This is the primary Memory Engine API.
 */
export function retrieveContext(
  request: MemoryRetrievalRequest = {}
): MemoryContextPackage {
  const start = now();

  const criteria = resolveCriteria(request);
  const index = buildIndex();

  const { candidates, selected } = selectMemories(index.memories, criteria);
  const { nodes, relationships, related, coveredMemories } = linkKnowledge(
    selected,
    index
  );
  const confidence = summarizeConfidence(selected);

  const statistics = buildStatistics({
    candidateCount: candidates.length,
    selected,
    nodes,
    relationships,
    related,
    coveredMemories,
    retrievalTimeMs: now() - start,
  });

  const summary: ContextSummaryMetadata = {
    requestedLimit: criteria.limit,
    ownerScope: criteria.ownerId
      ? `${criteria.ownerType ?? "any"}:${criteria.ownerId}`
      : criteria.ownerType ?? "all",
    memoryTypeScope: criteria.memoryType ?? "all",
    topMemoryTitle: selected[0]?.record.title ?? "—",
    topScore: selected[0]?.score ?? 0,
    generatedAt: new Date().toISOString(),
  };

  return {
    memories: selected,
    knowledgeNodes: nodes,
    relationships,
    relatedMemories: related,
    summary,
    confidence,
    statistics,
  };
}

/** Convenience: retrieve and return only the compact report. */
export function retrieveReport(
  request: MemoryRetrievalRequest = {}
): MemoryEngineReport {
  return buildReport(retrieveContext(request));
}
