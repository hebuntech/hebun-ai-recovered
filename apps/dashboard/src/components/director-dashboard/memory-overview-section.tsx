import { BookOpen } from "lucide-react";
import { ItemList } from "@/components/director-dashboard/item-list";
import { MetricGrid } from "@/components/director-dashboard/metric-grid";
import { SectionShell } from "@/components/director-dashboard/section-shell";
import { EmptyState } from "@/components/ui/empty-state";
import type { DirectorDashboardSnapshot } from "@/features/director-dashboard/foundation";

interface MemoryOverviewSectionProps {
  overview: DirectorDashboardSnapshot["memoryOverview"];
}

export function MemoryOverviewSection({ overview }: MemoryOverviewSectionProps) {
  return (
    <SectionShell
      title="Memory Overview"
      description="The authoritative runtime memory layer that preserves operating context, decisions, and reusable experience."
      eyebrow="Memory"
      href="/director/memory"
      ctaLabel="Open memory"
    >
      <div className="space-y-5">
        <MetricGrid metrics={overview.metrics} />
        {overview.items.length > 0 ? (
          <ItemList items={overview.items} />
        ) : (
          <EmptyState
            title="No memory records are currently visible"
            description="As soon as the active provider exposes memory records, this section will populate automatically."
            icon={<BookOpen className="size-5" />}
            eyebrow="Meaningful empty state"
          />
        )}
      </div>
    </SectionShell>
  );
}
