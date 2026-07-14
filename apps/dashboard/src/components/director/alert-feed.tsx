import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { escalationVariant, alertCategoryLabel } from "@/components/director/director-tokens";
import type { CriticalAlert } from "@/features/director/mock";
import type { EventSeverity } from "@/types";

const dot: Record<EventSeverity, string> = {
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
};

export function AlertFeed({ alerts, title = "Critical Alerts" }: { alerts: CriticalAlert[]; title?: string }) {
  if (alerts.length === 0) {
    return (
      <EmptyState
        title="No active alerts"
        description="This area will show escalations, approval risks, and compliance issues when they need Director attention."
      />
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <span className="text-xs font-medium text-fg-muted tabular-nums">{alerts.length} active</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {alerts.map((a) => (
          <div key={a.id} className="flex gap-3 rounded-lg border bg-surface-sunken p-4">
            <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", dot[a.severity])} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <span className="text-sm font-semibold leading-6 text-fg">{a.title}</span>
                <Badge variant={escalationVariant[a.escalation]}>{a.escalation}</Badge>
              </div>
              <p className="text-sm leading-6 text-fg-secondary">{a.detail}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-fg-muted">
                <span className="font-medium">{alertCategoryLabel[a.category]}</span>
                <span>·</span>
                <span className="tabular-nums">{a.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
