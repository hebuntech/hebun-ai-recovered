import { UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { priorityVariant } from "@/components/director/director-tokens";
import { interventionQueue } from "@/features/execution/mock";

export function HumanInterventionQueue() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="size-4 text-warning" />
          Human Intervention Queue
        </CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{interventionQueue.length} waiting</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {interventionQueue.map((h) => (
          <div key={h.id} className="flex flex-col gap-1 rounded-md border bg-surface-sunken p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-fg-muted">{h.execution}</span>
              <Badge variant={priorityVariant[h.priority]}>{h.priority}</Badge>
            </div>
            <p className="text-sm text-fg-secondary">{h.reason}</p>
            <span className="text-xs text-fg-muted">waiting {h.waiting}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
