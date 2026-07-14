import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { orgExecutionFlows, departmentName, type OrgExecutionFlow } from "@/features/organization/mock";

const flowStatusTone: Record<OrgExecutionFlow["status"], string> = {
  running: "text-success",
  waiting: "text-warning",
  completed: "text-fg-secondary",
  failed: "text-error",
};

const flowStatusDot: Record<OrgExecutionFlow["status"], string> = {
  running: "bg-success",
  waiting: "bg-warning",
  completed: "bg-fg-muted",
  failed: "bg-error",
};

export function ExecutionOverlay() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Execution Overlay</CardTitle>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          Live
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {orgExecutionFlows.map((flow) => (
          <div key={flow.id} className="rounded-md border bg-surface-sunken p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-fg">{flow.name}</span>
              <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium capitalize", flowStatusTone[flow.status])}>
                <span className={cn("size-1.5 rounded-full", flowStatusDot[flow.status])} />
                {flow.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {flow.path.map((deptId, i) => {
                const done = flow.status === "completed" || i < flow.currentStage;
                const active = flow.status !== "completed" && i === flow.currentStage;
                return (
                  <div key={deptId} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium",
                        active && "border-primary/40 bg-primary/12 text-primary",
                        done && "border-success/40 bg-success/12 text-success",
                        !active && !done && "text-fg-secondary"
                      )}
                    >
                      {departmentName[deptId] ?? deptId}
                    </span>
                    {i < flow.path.length - 1 && <ArrowRight className="size-3.5 text-fg-muted" />}
                  </div>
                );
              })}
              {flow.status === "completed" && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                  <ArrowRight className="size-3.5 text-fg-muted" />
                  <CheckCircle2 className="size-4" /> Completed
                </span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
