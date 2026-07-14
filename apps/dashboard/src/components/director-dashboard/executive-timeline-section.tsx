import { History } from "lucide-react";
import { SectionShell } from "@/components/director-dashboard/section-shell";
import { TimelineList } from "@/components/director-dashboard/timeline-list";
import { EmptyState } from "@/components/ui/empty-state";
import type { DashboardTimelineItem } from "@/features/director-dashboard/foundation";

interface ExecutiveTimelineSectionProps {
  items: DashboardTimelineItem[];
}

export function ExecutiveTimelineSection({ items }: ExecutiveTimelineSectionProps) {
  return (
    <SectionShell
      title="Executive Timeline"
      description="The latest memory and knowledge activity currently available from the authoritative runtime store."
      eyebrow="Timeline"
    >
      {items.length > 0 ? (
        <TimelineList items={items} />
      ) : (
        <EmptyState
          title="No executive timeline items are available"
          description="Once the runtime exposes timeline-worthy events through the active memory source, they will appear here."
          icon={<History className="size-5" />}
          eyebrow="Meaningful empty state"
        />
      )}
    </SectionShell>
  );
}
