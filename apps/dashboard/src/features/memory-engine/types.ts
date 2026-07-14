/*
 * Memory Engine — types.
 *
 * The Memory Engine is the first intelligence layer of Hebun. It sits on top of
 * the completed Memory CRUD and Knowledge Graph CRUD domains and performs
 * deterministic retrieval — no LLM, no embeddings, no vector search. Same input
 * always yields the same output.
 */

import type {
  MemoryCrudRecord,
  MemoryImportance,
  MemoryOwnerType,
  MemoryStatus,
  MemoryType,
} from "@/features/memory-crud";
import type {
  KnowledgeNodeRecord,
  RelationshipRecord,
} from "@/features/knowledge-crud";
import type { LifecycleStatus } from "@/features/persistence";

/**
 * A retrieval request. Every field is optional — the engine treats an empty
 * request as "everything active". Fields describe the context asking for
 * memories (an agent, a workflow, a department, a project, a customer, a
 * command, a decision, a conversation).
 */
export interface MemoryRetrievalRequest {
  /* Direct owner match. */
  ownerType?: MemoryOwnerType;
  ownerId?: string;

  /* Attribute filters. */
  memoryType?: MemoryType;
  importance?: MemoryImportance;
  /** Minimum confidence (0-100). Records below this are excluded. */
  minConfidence?: number;
  status?: MemoryStatus;
  lifecycle?: LifecycleStatus;
  tags?: string[];

  /* Context anchors — matched against owner + tags deterministically. */
  department?: string;
  agent?: string;
  workflow?: string;
  project?: string;
  customer?: string;

  /* Free-text term matched against the record haystack. */
  query?: string;

  /** Maximum memories to return after ranking. Defaults to {@link DEFAULT_LIMIT}. */
  limit?: number;
}

/** Normalised, fully-resolved criteria the filter stage consumes. */
export interface MemoryFilterCriteria {
  ownerType?: MemoryOwnerType;
  ownerId?: string;
  memoryType?: MemoryType;
  importance?: MemoryImportance;
  minConfidence: number;
  status?: MemoryStatus;
  lifecycle: LifecycleStatus | "any";
  tags: string[];
  anchors: string[];
  query: string;
  limit: number;
}

/** The individual contributions that produced a memory's rank. */
export interface RankFactors {
  importance: number;
  confidence: number;
  recency: number;
  tagMatch: number;
  ownerMatch: number;
  anchorMatch: number;
  queryMatch: number;
}

/** A memory paired with its deterministic score and the factors behind it. */
export interface RankedMemory {
  record: MemoryCrudRecord;
  score: number;
  factors: RankFactors;
}

/** A knowledge node reached from the selected memories, with the reason. */
export interface LinkedKnowledgeNode {
  node: KnowledgeNodeRecord;
  /** How this node was reached: owner bridge, tag overlap, or slug/title match. */
  via: KnowledgeLinkReason[];
}

export type KnowledgeLinkReason = "owner" | "tag" | "slug";

/** A relationship whose endpoints touch the linked knowledge nodes. */
export interface LinkedRelationship {
  relationship: RelationshipRecord;
  /** Node id inside the linked set. */
  anchorNode: string;
  /** The other endpoint of the edge. */
  neighborNode: string;
}

/** A related memory reached through the knowledge graph, not the direct filter. */
export interface RelatedMemory {
  record: MemoryCrudRecord;
  /** Knowledge node ids that bridged to this memory. */
  viaNodes: string[];
}

/** Confidence + importance rollups for the selected memory set. */
export interface ConfidenceSummary {
  averageConfidence: number;
  minConfidence: number;
  maxConfidence: number;
  averageImportanceScore: number;
  importanceBreakdown: Record<MemoryImportance, number>;
}

/** Everything the engine measured about the retrieval pass. */
export interface RetrievalStatistics {
  candidateCount: number;
  retrievedCount: number;
  knowledgeNodeCount: number;
  relationshipCount: number;
  relatedMemoryCount: number;
  averageConfidence: number;
  averageImportance: number;
  /** Fraction (0-1) of retrieved memories that linked to at least one node. */
  knowledgeCoverage: number;
  retrievalTimeMs: number;
}

/** Small header describing what was asked and what came back. */
export interface ContextSummaryMetadata {
  requestedLimit: number;
  ownerScope: string;
  memoryTypeScope: string;
  topMemoryTitle: string;
  topScore: number;
  generatedAt: string;
}

/**
 * The Context Package — the engine's deliverable. Deterministic, self-contained,
 * no LLM summarisation. This is what downstream reasoning layers will consume.
 */
export interface MemoryContextPackage {
  memories: RankedMemory[];
  knowledgeNodes: LinkedKnowledgeNode[];
  relationships: LinkedRelationship[];
  relatedMemories: RelatedMemory[];
  summary: ContextSummaryMetadata;
  confidence: ConfidenceSummary;
  statistics: RetrievalStatistics;
}

/** Compact report suitable for dashboards and telemetry panels. */
export interface MemoryEngineReport {
  retrievedCount: number;
  averageConfidence: number;
  averageImportance: number;
  knowledgeCoverage: number;
  relationshipCount: number;
  retrievalTimeMs: number;
}
