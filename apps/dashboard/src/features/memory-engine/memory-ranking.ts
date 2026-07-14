/*
 * Memory Engine — deterministic ranking.
 *
 * No AI scoring. No randomness. No wall-clock reads. Scores are a fixed weighted
 * sum of signals derived only from the candidate set and the request. Ties break
 * on record id ascending, so the output order is stable for identical input.
 */

import type { MemoryCrudRecord, MemoryImportance } from "@/features/memory-crud";
import { normalizeTag } from "./memory-index";
import type {
  MemoryFilterCriteria,
  RankFactors,
  RankedMemory,
} from "./types";

/** Ordinal weight per importance level. Higher = more important. */
export const IMPORTANCE_SCORE: Record<MemoryImportance, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/** Signal weights. Kept as named constants so ranking stays auditable. */
export const RANK_WEIGHTS = {
  importance: 5,
  confidence: 3,
  recency: 2,
  tagMatch: 4,
  ownerMatch: 6,
  anchorMatch: 4,
  queryMatch: 3,
} as const;

/** Milliseconds since epoch for an ISO timestamp; 0 when unparseable. */
function toMs(iso: string): number {
  const value = Date.parse(iso);
  return Number.isNaN(value) ? 0 : value;
}

/**
 * Recency bounds from the candidate set itself (not the clock), so the same
 * candidates always produce the same recency scores.
 */
interface RecencyScale {
  min: number;
  span: number;
}

function recencyScale(records: MemoryCrudRecord[]): RecencyScale {
  let min = Infinity;
  let max = -Infinity;
  for (const record of records) {
    const ms = toMs(record.updatedAt);
    if (ms < min) min = ms;
    if (ms > max) max = ms;
  }
  if (min === Infinity) return { min: 0, span: 0 };
  return { min, span: max - min };
}

function recencyScore(record: MemoryCrudRecord, scale: RecencyScale): number {
  if (scale.span === 0) return 1;
  return (toMs(record.updatedAt) - scale.min) / scale.span;
}

function tagMatchScore(
  record: MemoryCrudRecord,
  criteria: MemoryFilterCriteria
): number {
  if (criteria.tags.length === 0) return 0;
  const recordTags = new Set(record.tags.map(normalizeTag));
  let hits = 0;
  for (const tag of criteria.tags) if (recordTags.has(tag)) hits += 1;
  return hits / criteria.tags.length;
}

function ownerMatchScore(
  record: MemoryCrudRecord,
  criteria: MemoryFilterCriteria
): number {
  if (!criteria.ownerId && !criteria.ownerType) return 0;
  const ownerIdMatch = criteria.ownerId ? record.ownerId === criteria.ownerId : true;
  const ownerTypeMatch = criteria.ownerType
    ? record.ownerType === criteria.ownerType
    : true;
  if (criteria.ownerId && criteria.ownerType) {
    return ownerIdMatch && ownerTypeMatch ? 1 : 0;
  }
  return ownerIdMatch && ownerTypeMatch ? 1 : 0;
}

/**
 * Anchor match: context hints (agent/workflow/department/project/customer)
 * compared against owner id/type and tags. Fraction of anchors that hit.
 */
function anchorMatchScore(
  record: MemoryCrudRecord,
  criteria: MemoryFilterCriteria
): number {
  if (criteria.anchors.length === 0) return 0;
  const recordTags = new Set(record.tags.map(normalizeTag));
  const ownerId = record.ownerId.toLowerCase();
  const ownerType = record.ownerType.toLowerCase();
  let hits = 0;
  for (const anchor of criteria.anchors) {
    if (ownerId === anchor || ownerType === anchor || recordTags.has(anchor)) {
      hits += 1;
    }
  }
  return hits / criteria.anchors.length;
}

function queryMatchScore(
  record: MemoryCrudRecord,
  criteria: MemoryFilterCriteria
): number {
  if (!criteria.query) return 0;
  const title = record.title.toLowerCase();
  const summary = record.summary.toLowerCase();
  if (title.includes(criteria.query)) return 1;
  if (summary.includes(criteria.query)) return 0.6;
  return 0.3; // passed the filter haystack, weaker field match
}

export function scoreMemory(
  record: MemoryCrudRecord,
  criteria: MemoryFilterCriteria,
  scale: RecencyScale
): RankedMemory {
  const factors: RankFactors = {
    importance: IMPORTANCE_SCORE[record.importance] / 4,
    confidence: clamp01(record.confidence / 100),
    recency: recencyScore(record, scale),
    tagMatch: tagMatchScore(record, criteria),
    ownerMatch: ownerMatchScore(record, criteria),
    anchorMatch: anchorMatchScore(record, criteria),
    queryMatch: queryMatchScore(record, criteria),
  };

  const score =
    factors.importance * RANK_WEIGHTS.importance +
    factors.confidence * RANK_WEIGHTS.confidence +
    factors.recency * RANK_WEIGHTS.recency +
    factors.tagMatch * RANK_WEIGHTS.tagMatch +
    factors.ownerMatch * RANK_WEIGHTS.ownerMatch +
    factors.anchorMatch * RANK_WEIGHTS.anchorMatch +
    factors.queryMatch * RANK_WEIGHTS.queryMatch;

  return { record, score: round(score), factors };
}

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/**
 * Rank candidates deterministically. Higher score first; ties broken by record
 * id ascending so identical input yields byte-identical order.
 */
export function rankMemories(
  records: MemoryCrudRecord[],
  criteria: MemoryFilterCriteria
): RankedMemory[] {
  const scale = recencyScale(records);
  const ranked = records.map((record) => scoreMemory(record, criteria, scale));
  ranked.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.record.id < b.record.id ? -1 : a.record.id > b.record.id ? 1 : 0;
  });
  return ranked;
}
