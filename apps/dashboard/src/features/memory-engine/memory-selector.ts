/*
 * Memory Engine — selector.
 *
 * Ties the filter and ranking stages together: narrow the candidate set with
 * hard filters, rank what remains deterministically, then cap at the limit.
 */

import type { MemoryCrudRecord } from "@/features/memory-crud";
import { filterMemories } from "./memory-filters";
import { rankMemories } from "./memory-ranking";
import type {
  MemoryFilterCriteria,
  RankedMemory,
} from "./types";

export interface SelectionResult {
  candidates: MemoryCrudRecord[];
  ranked: RankedMemory[];
  selected: RankedMemory[];
}

/** Filter → rank → cap. All three stages are deterministic. */
export function selectMemories(
  records: MemoryCrudRecord[],
  criteria: MemoryFilterCriteria
): SelectionResult {
  const candidates = filterMemories(records, criteria);
  const ranked = rankMemories(candidates, criteria);
  const selected = ranked.slice(0, criteria.limit);
  return { candidates, ranked, selected };
}
