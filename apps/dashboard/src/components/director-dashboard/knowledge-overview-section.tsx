import { Network } from "lucide-react";
import { ItemList } from "@/components/director-dashboard/item-list";
import { MetricGrid } from "@/components/director-dashboard/metric-grid";
import { SectionShell } from "@/components/director-dashboard/section-shell";
import { EmptyState } from "@/components/ui/empty-state";
import type { DirectorDashboardSnapshot } from "@/features/director-dashboard/foundation";

interface KnowledgeOverviewSectionProps {
  overview: DirectorDashboardSnapshot["knowledgeOverview"];
}

export function KnowledgeOverviewSection({ overview }: KnowledgeOverviewSectionProps) {
  return (
    <SectionShell
      title="Knowledge Overview"
      description="Reusable organizational truth available to guide current and future execution."
      eyebrow="Knowledge"
      href="/director/knowledge-graph"
      ctaLabel="Open knowledge"
    >
      <div className="space-y-5">
        <MetricGrid metrics={overview.metrics} />
        {overview.items.length > 0 ? (
          <ItemList items={overview.items} />
        ) : (
          <EmptyState
            title="No knowledge records are currently visible"
            description="Knowledge nodes will appear here once they are available from the authoritative read path."
            icon={<Network className="size-5" />}
            eyebrow="Meaningful empty state"
          />
        )}
      </div>
    </SectionShell>
  );
}
