/*
 * Memory Engine — the first deterministic intelligence layer of Hebun.
 *
 * Retrieval only: it reads through Memory CRUD and Knowledge Graph CRUD and
 * returns the most relevant memories as a Context Package. No LLM, no
 * embeddings, no vector search. Same input → same output, every time.
 */

export * from "./types";
export { retrieveContext, retrieveReport } from "./memory-engine";
export { resolveCriteria, filterMemories, DEFAULT_LIMIT } from "./memory-filters";
export { rankMemories, scoreMemory, RANK_WEIGHTS, IMPORTANCE_SCORE } from "./memory-ranking";
export { selectMemories } from "./memory-selector";
export { buildIndex, ownerKey, normalizeTag } from "./memory-index";
export type { MemoryEngineIndex } from "./memory-index";
export { linkKnowledge, summarizeConfidence } from "./memory-context";
export { buildStatistics, buildReport } from "./memory-report";
