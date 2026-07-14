import { Workflow as WorkflowIcon, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Workflow } from "@/types";

export function WorkflowCard({ workflow }: { workflow: Workflow }) {
  return (
    <Card className="transition-shadow duration-(--dur-fast) hover:shadow-md">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-info-subtle text-info">
              <WorkflowIcon className="size-5" />
            </span>
            <div>
              <h3 className="text-sm font-semibold">{workflow.name}</h3>
              <p className="flex items-center gap-1 text-xs text-fg-secondary">
                <Zap className="size-3" />
                {workflow.trigger}
              </p>
            </div>
          </div>
          <StatusBadge status={workflow.status} pulse />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-fg-muted">Success rate</span>
            <span className="font-semibold tabular-nums text-fg">
              {workflow.successRate}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
            <div
              className="h-full rounded-full bg-success"
              style={{ width: `${workflow.successRate}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t pt-4 text-xs">
          <div>
            <p className="text-fg-muted">Owner</p>
            <p className="truncate font-semibold text-fg">{workflow.ownerAgent}</p>
          </div>
          <div>
            <p className="text-fg-muted">Runs today</p>
            <p className="font-semibold tabular-nums text-fg">{workflow.runsToday}</p>
          </div>
          <div>
            <p className="text-fg-muted">Last run</p>
            <p className="font-semibold text-fg">{workflow.lastRun}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
