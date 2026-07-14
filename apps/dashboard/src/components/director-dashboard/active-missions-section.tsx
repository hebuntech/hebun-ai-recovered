import { Target } from "lucide-react";
import { SectionShell } from "@/components/director-dashboard/section-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { ItemList } from "@/components/director-dashboard/item-list";
import type { DashboardSectionItem } from "@/features/director-dashboard/foundation";

interface ActiveMissionsSectionProps {
  items: DashboardSectionItem[];
}

export function ActiveMissionsSection({ items }: ActiveMissionsSectionProps) {
  return (
    <SectionShell
      title="Active Missions"
      description="Mission records surfaced from the current strategic runtime."
      eyebrow="Strategic Intent"
    >
      {items.length > 0 ? (
        <ItemList items={items} />
      ) : (
        <EmptyState
          title="No active mission records are available yet"
          description="The dashboard is staying truthful: no mission entities are available through the current authoritative runtime read surface yet."
          icon={<Target className="size-5" />}
          eyebrow="Meaningful empty state"
        />
      )}
    </SectionShell>
  );
}
