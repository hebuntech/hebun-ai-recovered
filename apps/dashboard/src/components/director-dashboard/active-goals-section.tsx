import { Flag } from "lucide-react";
import { SectionShell } from "@/components/director-dashboard/section-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { ItemList } from "@/components/director-dashboard/item-list";
import type { DashboardSectionItem } from "@/features/director-dashboard/foundation";

interface ActiveGoalsSectionProps {
  items: DashboardSectionItem[];
}

export function ActiveGoalsSection({ items }: ActiveGoalsSectionProps) {
  return (
    <SectionShell
      title="Active Goals"
      description="Goal records surfaced from the current memory-backed knowledge layer."
      eyebrow="Goal Registry"
      href="/director/goals"
      ctaLabel="Open goals"
    >
      {items.length > 0 ? (
        <ItemList items={items} />
      ) : (
        <EmptyState
          title="No active goals are available"
          description="As goal entities begin to flow through the organization runtime, they will appear here automatically."
          icon={<Flag className="size-5" />}
          eyebrow="Meaningful empty state"
        />
      )}
    </SectionShell>
  );
}
