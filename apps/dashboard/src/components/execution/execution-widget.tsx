import Link from "next/link";
import { ArrowRight, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { executionMetrics } from "@/features/execution";

export function ExecutionWidget() {
  const tiles = [
    { label: "Running Sessions", value: `${executionMetrics.runningSessions}` },
    { label: "Queued Sessions", value: `${executionMetrics.queuedSessions}` },
    { label: "Completed", value: `${executionMetrics.completedSessions}` },
    { label: "Failed", value: `${executionMetrics.failedSessions}` },
    { label: "Retry Rate", value: `${executionMetrics.retryRate}%` },
    { label: "Health", value: `${executionMetrics.executionHealth}` },
    { label: "Avg Duration", value: executionMetrics.averageDuration },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-4 text-primary" />
          Execution Engine
        </CardTitle>
        <span className="text-xs text-fg-muted">
          provider-independent execution runtime for orchestration blueprints
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-7">
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
          href="/director/execution"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Execution Engine
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
