import { StatCard } from "@/components/dashboard/stat-card";
import { reasoningMetrics } from "@/features/reasoning";

export function ReasoningSummary() {
  return (
    <>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Open Sessions" value={`${reasoningMetrics.openSessions}`} />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Average Confidence" value={`${reasoningMetrics.averageConfidence}`} />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Health" value={`${reasoningMetrics.health}`} />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Total Sessions" value={`${reasoningMetrics.totalSessions}`} />
      </div>
    </>
  );
}
