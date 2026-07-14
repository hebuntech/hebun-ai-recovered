import { Network } from "lucide-react";
import { KnowledgeGraphPanel } from "@/components/knowledge-graph/knowledge-graph-panel";
import { KnowledgeRegistryWorkspace } from "@/components/knowledge-graph/knowledge-registry-workspace";
import { MemoryEnginePanel } from "@/components/memory-engine/memory-engine-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { knowledgeGraphMetrics } from "@/features/knowledge-graph";

export default function KnowledgeGraphPage() {
  return (
    <>
      <PageHeader
        title="Knowledge Graph"
        context="The unified company relationship model that future planning, memory, workflows, and reasoning systems will build on."
        action={
          <Badge variant={knowledgeGraphMetrics.healthSummary.badge}>
            Graph Health {knowledgeGraphMetrics.graphHealth}
          </Badge>
        }
      />

      <div className="mb-6 flex items-center gap-2 text-sm text-fg-secondary">
        <Network className="size-4 text-primary" />
        Computed directly from existing registry data and typed relationship rules.
      </div>

      <div className="flex flex-col gap-6">
        <KnowledgeRegistryWorkspace />
        <MemoryEnginePanel />
        <KnowledgeGraphPanel />
      </div>
    </>
  );
}
