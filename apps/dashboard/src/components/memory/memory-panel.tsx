import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { companyMemories, memoryMetrics } from "@/features/memory";
import { MemoryDetail } from "@/components/memory/memory-detail";
import { MemoryHealth } from "@/components/memory/memory-health";
import { MemoryMetricsCard } from "@/components/memory/memory-metrics";
import { MemorySearch } from "@/components/memory/memory-search";
import { MemorySummary } from "@/components/memory/memory-summary";
import { MemoryTable } from "@/components/memory/memory-table";
import { MemoryTimeline } from "@/components/memory/memory-timeline";
import { MemoryTypes } from "@/components/memory/memory-types";

export function MemoryPanel() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <MemorySummary />

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Company Memory Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-fg-secondary">
              The memory layer records what happened, why it happened, who was
              involved, what changed, what was learned, and what should be reused
              later. It references existing registries and knowledge graph objects
              instead of duplicating them.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MemoryHealth />
      </div>
      <div className="col-span-12 xl:col-span-7">
        <MemoryMetricsCard />
      </div>

      <div className="col-span-12">
        <MemoryTypes />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <MemoryTimeline memories={companyMemories.slice(0, 8)} />
      </div>
      <div className="col-span-12 xl:col-span-5">
        <MemorySearch />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Decisions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {memoryMetrics.recentDecisions.map((memory) => (
              <MemoryDetail key={memory.id} memory={memory} />
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="col-span-12 xl:col-span-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Learnings</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {memoryMetrics.recentLearnings.map((memory) => (
              <MemoryDetail key={memory.id} memory={memory} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 xl:col-span-6">
        <Card>
          <CardHeader>
            <CardTitle>Procedural Assets</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {memoryMetrics.proceduralAssets.map((memory) => (
              <MemoryDetail key={memory.id} memory={memory} />
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="col-span-12 xl:col-span-6">
        <Card>
          <CardHeader>
            <CardTitle>Conversation Summaries</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {memoryMetrics.conversationSummaries.map((memory) => (
              <MemoryDetail key={memory.id} memory={memory} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <MemoryTable memories={companyMemories} title="Memory Layer Table" />
      </div>
    </div>
  );
}
