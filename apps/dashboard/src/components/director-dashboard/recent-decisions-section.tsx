import { Scale } from "lucide-react";
import { SectionShell } from "@/components/director-dashboard/section-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { ItemList } from "@/components/director-dashboard/item-list";
import type { DashboardSectionItem } from "@/features/director-dashboard/foundation";

interface RecentDecisionsSectionProps {
  items: DashboardSectionItem[];
}

export function RecentDecisionsSection({ items }: RecentDecisionsSectionProps) {
  return (
    <SectionShell
      title="Recent Decisions"
      description="Decision memory currently available to the Director without introducing chat or mutation flows."
      eyebrow="Decision Memory"
      href="/director/memory"
      ctaLabel="Open decision history"
    >
      {items.length > 0 ? (
        <ItemList items={items} />
      ) : (
        <EmptyState
          title="No decision records are available"
          description="Once decision memory begins flowing through the runtime, this section will show the latest executive-relevant decisions."
          icon={<Scale className="size-5" />}
          eyebrow="Meaningful empty state"
        />
      )}
    </SectionShell>
  );
}
