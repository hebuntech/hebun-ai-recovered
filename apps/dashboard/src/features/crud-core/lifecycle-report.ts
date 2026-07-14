/*
 * CRUD core — lifecycle report helpers.
 */

import type { LifecycleStatus } from "@/features/persistence";

export interface LifecycleRecord {
  lifecycleStatus: LifecycleStatus;
}

export function countByLifecycle<T extends LifecycleRecord>(records: T[]) {
  return {
    total: records.length,
    active: records.filter((record) => record.lifecycleStatus === "active").length,
    archived: records.filter((record) => record.lifecycleStatus === "archived").length,
    deleted: records.filter((record) => record.lifecycleStatus === "deleted").length,
  };
}

export function averageLatency(totalLatencyMs: number, mutationCount: number): number {
  return mutationCount ? Math.round(totalLatencyMs / mutationCount) : 0;
}
