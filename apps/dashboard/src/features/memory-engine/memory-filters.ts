/*
 * Memory Engine — deterministic filters.
 *
 * Normalises a raw request into resolved criteria, then narrows the memory set.
 * Pure predicates only — no scoring, no ordering. Ranking happens downstream.
 */

import type { MemoryCrudRecord } from "@/features/memory-crud";
import { normalizeTag } from "./memory-index";
import type { MemoryFilterCriteria, MemoryRetrievalRequest } from "./types";

export const DEFAULT_LIMIT = 10;

/** Anchors are context hints (agent/workflow/department/project/customer). */
function collectAnchors(request: MemoryRetrievalRequest): string[] {
  const raw = [
    request.department,
    request.agent,
    request.workflow,
    request.project,
    request.customer,
  ];
  const seen = new Set<string>();
  const anchors: string[] = [];
  for (const value of raw) {
    if (!value) continue;
    const normalized = value.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    anchors.push(normalized);
  }
  return anchors;
}

/** Resolve a request into criteria with every default made explicit. */
export function resolveCriteria(
  request: MemoryRetrievalRequest
): MemoryFilterCriteria {
  const limit =
    typeof request.limit === "number" && request.limit > 0
      ? Math.floor(request.limit)
      : DEFAULT_LIMIT;

  return {
    ownerType: request.ownerType,
    ownerId: request.ownerId?.trim() || undefined,
    memoryType: request.memoryType,
    importance: request.importance,
    minConfidence:
      typeof request.minConfidence === "number" ? request.minConfidence : 0,
    status: request.status,
    lifecycle: request.lifecycle ?? "active",
    tags: (request.tags ?? []).map(normalizeTag).filter(Boolean),
    anchors: collectAnchors(request),
    query: (request.query ?? "").trim().toLowerCase(),
    limit,
  };
}

function haystack(record: MemoryCrudRecord): string {
  return [
    record.id,
    record.title,
    record.slug,
    record.description,
    record.memoryType,
    record.ownerType,
    record.ownerId,
    record.source,
    record.summary,
    record.tags.join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

/** Does a memory pass every hard filter in the criteria? */
export function matchesCriteria(
  record: MemoryCrudRecord,
  criteria: MemoryFilterCriteria
): boolean {
  if (criteria.lifecycle !== "any" && record.lifecycleStatus !== criteria.lifecycle) {
    return false;
  }
  if (criteria.ownerType && record.ownerType !== criteria.ownerType) return false;
  if (criteria.ownerId && record.ownerId !== criteria.ownerId) return false;
  if (criteria.memoryType && record.memoryType !== criteria.memoryType) return false;
  if (criteria.importance && record.importance !== criteria.importance) return false;
  if (criteria.status && record.status !== criteria.status) return false;
  if (record.confidence < criteria.minConfidence) return false;

  if (criteria.tags.length > 0) {
    const recordTags = new Set(record.tags.map(normalizeTag));
    const hasEvery = criteria.tags.every((tag) => recordTags.has(tag));
    if (!hasEvery) return false;
  }

  if (criteria.query && !haystack(record).includes(criteria.query)) return false;

  return true;
}

/** Apply the hard filters. Preserves store order; ranking reorders later. */
export function filterMemories(
  records: MemoryCrudRecord[],
  criteria: MemoryFilterCriteria
): MemoryCrudRecord[] {
  return records.filter((record) => matchesCriteria(record, criteria));
}
