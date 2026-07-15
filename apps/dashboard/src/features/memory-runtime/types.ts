import type {
  ExecutiveOverviewRuntimeModel,
  ExecutiveTimelineEventRuntimeModel,
} from "@/features/executive-runtime-support/types";
import type { MemoryEngineReport } from "@/features/memory-engine";

export type MemoryRuntimeReport = Omit<MemoryEngineReport, "retrievalTimeMs">;

export interface MemoryRuntimeStatistics {
  readonly active: number;
  readonly typeCounts: Readonly<Record<string, number>>;
}

export interface MemoryRuntimeProjection {
  readonly overview: ExecutiveOverviewRuntimeModel;
  readonly timeline: ExecutiveTimelineEventRuntimeModel[];
  readonly report: MemoryRuntimeReport;
  readonly statistics: MemoryRuntimeStatistics;
}
