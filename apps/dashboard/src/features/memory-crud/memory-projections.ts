/*
 * Memory CRUD — projections for existing UI surfaces.
 */

import type { MemoryCrudRecord } from "./types";

export interface MemoryWidgetMetrics {
  total: number;
  decisions: number;
  facts: number;
  procedures: number;
  organizations: number;
}

export function toWidgetMetrics(records: MemoryCrudRecord[]): MemoryWidgetMetrics {
  const live = records.filter((record) => record.lifecycleStatus !== "deleted");

  return {
    total: live.length,
    decisions: live.filter((record) => record.memoryType === "Decision").length,
    facts: live.filter((record) => record.memoryType === "Fact").length,
    procedures: live.filter((record) => record.memoryType === "Procedure").length,
    organizations: live.filter((record) => record.memoryType === "Organization").length,
  };
}
