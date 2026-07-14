import { Lightbulb } from "lucide-react";
import { SectionShell } from "@/components/director-dashboard/section-shell";
import { SignalList } from "@/components/director-dashboard/signal-list";
import { EmptyState } from "@/components/ui/empty-state";
import type { DashboardSignal } from "@/features/director-dashboard/foundation";

interface OpportunitiesSectionProps {
  items: DashboardSignal[];
}

export function OpportunitiesSection({ items }: OpportunitiesSectionProps) {
  return (
    <SectionShell
      title="Opportunities"
      description="High-signal areas where the current operating state suggests leverage, reuse, or available capacity."
      eyebrow="Opportunity"
    >
      {items.length > 0 ? (
        <SignalList items={items} />
      ) : (
        <EmptyState
          title="No opportunities are currently surfaced"
          description="As stronger runtime patterns accumulate, the dashboard will expose them here without changing any execution behavior."
          icon={<Lightbulb className="size-5" />}
          eyebrow="Meaningful empty state"
        />
      )}
    </SectionShell>
  );
}
