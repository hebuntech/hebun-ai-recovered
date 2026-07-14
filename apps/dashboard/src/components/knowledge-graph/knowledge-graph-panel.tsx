import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { companyKnowledgeGraph, knowledgeGraphMetrics } from "@/features/knowledge-graph";
import { KnowledgeGraphHealth } from "@/components/knowledge-graph/knowledge-graph-health";
import { KnowledgeGraphMetricsCard } from "@/components/knowledge-graph/knowledge-graph-metrics";
import { KnowledgeGraphRelationships } from "@/components/knowledge-graph/knowledge-graph-relationships";
import { KnowledgeGraphSummary } from "@/components/knowledge-graph/knowledge-graph-summary";
import { KnowledgeGraphTable } from "@/components/knowledge-graph/knowledge-graph-table";

export function KnowledgeGraphPanel() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <KnowledgeGraphSummary />

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Company Knowledge Graph Foundation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-fg-secondary">
              The graph unifies registry records into a typed relationship layer so
              future agents, workflows, planning systems, and memory systems can
              reason over one connected company model instead of isolated registries.
            </p>
            <p className="mt-3 text-sm text-fg-secondary">
              {knowledgeGraphMetrics.totalNodes} nodes and{" "}
              {knowledgeGraphMetrics.totalRelationships} typed relationships are
              currently derived from the existing registry layer.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 xl:col-span-5">
        <KnowledgeGraphHealth />
      </div>
      <div className="col-span-12 xl:col-span-7">
        <KnowledgeGraphMetricsCard />
      </div>

      <div className="col-span-12">
        <KnowledgeGraphRelationships
          relationships={companyKnowledgeGraph.edges.slice(0, 10)}
        />
      </div>

      <div className="col-span-12">
        <KnowledgeGraphTable nodes={companyKnowledgeGraph.nodes.slice(0, 16)} />
      </div>
    </div>
  );
}
