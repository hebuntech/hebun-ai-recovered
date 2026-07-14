import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import type { DashboardSectionItem } from "@/features/director-dashboard/foundation";

interface ItemListProps {
  items: DashboardSectionItem[];
}

const runtimeStatuses = new Set([
  "running",
  "idle",
  "paused",
  "error",
  "failed",
  "scheduled",
  "connected",
  "pending",
  "syncing",
]);

const textStatuses: Record<string, string> = {
  verified: "Verified",
  provisional: "Provisional",
  review: "In Review",
  stable: "Stable",
  fresh: "Fresh",
};

export function ItemList({ items }: ItemListProps) {
  return (
    <div className="divide-y divide-border">
      {items.map((item) => {
        const statusContent = item.status ? (
          runtimeStatuses.has(item.status) ? (
            <StatusBadge status={item.status as never} />
          ) : (
            <span className="inline-flex rounded-full bg-surface-sunken px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-fg-secondary">
              {textStatuses[item.status] ?? item.status}
            </span>
          )
        ) : null;

        const content = (
          <div className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium leading-6 text-fg">{item.title}</p>
              <p className="text-sm leading-6 text-fg-secondary">{item.detail}</p>
              {item.meta ? (
                <p className="text-xs leading-5 text-fg-muted">{item.meta}</p>
              ) : null}
            </div>
            {statusContent ? <div className="shrink-0">{statusContent}</div> : null}
          </div>
        );

        return item.href ? (
          <Link key={item.id} href={item.href} className="block transition hover:opacity-90">
            {content}
          </Link>
        ) : (
          <div key={item.id}>{content}</div>
        );
      })}
    </div>
  );
}
