import { StatCard } from "@/components/dashboard/stat-card";
import { memoryMetrics } from "@/features/memory";

export function MemorySummary() {
  return (
    <>
      <div className="col-span-6 sm:col-span-4 xl:col-span-2">
        <StatCard label="Total Memories" value={`${memoryMetrics.totalMemories}`} />
      </div>
      <div className="col-span-6 sm:col-span-4 xl:col-span-2">
        <StatCard label="Decision Memories" value={`${memoryMetrics.decisionMemories}`} />
      </div>
      <div className="col-span-6 sm:col-span-4 xl:col-span-2">
        <StatCard label="Learnings" value={`${memoryMetrics.learningMemories}`} />
      </div>
      <div className="col-span-6 sm:col-span-4 xl:col-span-2">
        <StatCard label="Procedures" value={`${memoryMetrics.procedures}`} />
      </div>
      <div className="col-span-6 sm:col-span-4 xl:col-span-2">
        <StatCard label="Timeline Items" value={`${memoryMetrics.timelineItems}`} />
      </div>
      <div className="col-span-6 sm:col-span-4 xl:col-span-2">
        <StatCard label="Health Score" value={`${memoryMetrics.healthScore}`} />
      </div>
    </>
  );
}
