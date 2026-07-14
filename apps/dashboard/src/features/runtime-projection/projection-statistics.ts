import type { RuntimeProjectionStatistics } from "./types";

export function createProjectionStatistics(): RuntimeProjectionStatistics {
  return {
    refreshCount: 0,
    lastDurationMs: 0,
    lastRefreshResult: "never",
    itemCount: 0,
  };
}
