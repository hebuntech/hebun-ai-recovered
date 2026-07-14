import { GitBranch } from "lucide-react";
import { SectionShell } from "@/components/director-dashboard/section-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { ItemList } from "@/components/director-dashboard/item-list";
import type { DashboardSectionItem } from "@/features/director-dashboard/foundation";

interface WorkflowActivitySectionProps {
  items: DashboardSectionItem[];
}

export function WorkflowActivitySection({ items }: WorkflowActivitySectionProps) {
  return (
    <SectionShell
      title="Workflow Activity"
      description="Current workflow posture from the active memory-backed workflow registry."
      eyebrow="Workflow Runtime"
      href="/director/registries/workflows"
      ctaLabel="Open workflows"
    >
      {items.length > 0 ? (
        <ItemList items={items} />
      ) : (
        <EmptyState
          title="No workflow activity is currently visible"
          description="Workflow records will appear here when they are available from the authoritative runtime provider."
          icon={<GitBranch className="size-5" />}
          eyebrow="Meaningful empty state"
        />
      )}
    </SectionShell>
  );
}
