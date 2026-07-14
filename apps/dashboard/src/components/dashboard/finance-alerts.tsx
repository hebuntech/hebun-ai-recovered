import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { financeAlerts } from "@/features/finance/mock";
import type { EventSeverity } from "@/types";

const severityText: Record<EventSeverity, string> = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
};

export function FinanceAlerts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Finance Alerts</CardTitle>
        <span className="text-xs tabular-nums text-fg-muted">
          {financeAlerts.length} active
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {financeAlerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start gap-3 rounded-md border bg-surface-sunken p-3"
          >
            <AlertTriangle
              className={cn("mt-0.5 size-4 shrink-0", severityText[alert.severity])}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-fg">{alert.title}</p>
                <span className="shrink-0 text-xs text-fg-muted">{alert.timestamp}</span>
              </div>
              <p className="text-xs text-fg-secondary">{alert.detail}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
