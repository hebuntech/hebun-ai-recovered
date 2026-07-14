import { Bot } from "lucide-react";
import { SectionShell } from "@/components/director-dashboard/section-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { ItemList } from "@/components/director-dashboard/item-list";
import type { DashboardSectionItem } from "@/features/director-dashboard/foundation";

interface AgentActivitySectionProps {
  items: DashboardSectionItem[];
}

export function AgentActivitySection({ items }: AgentActivitySectionProps) {
  return (
    <SectionShell
      title="Agent Activity"
      description="The current AI workforce footprint, ranked by live operating posture and workload."
      eyebrow="Agent Runtime"
      href="/director/agents"
      ctaLabel="Open agents"
    >
      {items.length > 0 ? (
        <ItemList items={items} />
      ) : (
        <EmptyState
          title="No agent activity is currently visible"
          description="Agent runtime records will appear here as soon as they are available from the active provider."
          icon={<Bot className="size-5" />}
          eyebrow="Meaningful empty state"
        />
      )}
    </SectionShell>
  );
}
