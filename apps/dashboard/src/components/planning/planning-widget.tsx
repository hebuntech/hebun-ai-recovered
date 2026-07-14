import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { planningMetrics } from "@/features/planning";

export function PlanningWidget() {
  const tiles = [
    { label: "Active Plans", value: `${planningMetrics.activePlans}` },
    { label: "Tasks", value: `${planningMetrics.tasksGenerated}` },
    { label: "Milestones", value: `${planningMetrics.milestones}` },
    { label: "Blocked", value: `${planningMetrics.blockedPlans}` },
    { label: "Avg Estimate", value: planningMetrics.averageCompletionEstimate },
    { label: "Health", value: `${planningMetrics.planningHealth}` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="size-4 text-primary" />
          Planning Engine
        </CardTitle>
        <span className="text-xs text-fg-muted">
          deterministic plan construction layer between governance and future orchestration
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                {tile.label}
              </p>
              <p className="mt-1 text-sm font-bold text-fg">{tile.value}</p>
            </div>
          ))}
        </div>
        <Link
          href="/director/planning"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Planning Engine
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
