import type { DashboardTimelineItem } from "@/features/director-dashboard/foundation";

interface TimelineListProps {
  items: DashboardTimelineItem[];
}

export function TimelineList({ items }: TimelineListProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex gap-4">
          <div className="flex w-24 shrink-0 flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-fg-muted">
              {item.kind}
            </span>
            <span className="text-xs leading-5 text-fg-secondary">{item.when}</span>
          </div>
          <div className="min-w-0 flex-1 border-l border-border pl-4">
            <p className="text-sm font-medium leading-6 text-fg">{item.title}</p>
            <p className="text-sm leading-6 text-fg-secondary">{item.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
