import { StatCard } from "@/components/dashboard/stat-card";
import { knowledgeGraphMetrics } from "@/features/knowledge-graph";

export function KnowledgeGraphSummary() {
  return (
    <>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Total Nodes" value={`${knowledgeGraphMetrics.totalNodes}`} />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard
          label="Total Relationships"
          value={`${knowledgeGraphMetrics.totalRelationships}`}
        />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard
          label="Connected Components"
          value={`${knowledgeGraphMetrics.connectedComponents}`}
        />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard
          label="Graph Health"
          value={`${knowledgeGraphMetrics.graphHealth}`}
          caption={knowledgeGraphMetrics.healthSummary.status}
        />
      </div>
    </>
  );
}
