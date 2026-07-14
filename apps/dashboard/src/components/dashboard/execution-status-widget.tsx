import Link from "next/link";
import { ArrowRight, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { executionMetrics as m } from "@/features/execution/mock";

export function ExecutionStatusWidget() {
  const tiles = [
    { label: "Running", value: `${m.running}` },
    { label: "Waiting", value: `${m.waiting}` },
    { label: "Failed", value: `${m.failed}` },
    { label: "Blocked", value: `${m.blocked}` },
    { label: "Avg Duration", value: m.avgDuration },
    { label: "Exec Health", value: `${m.executionHealth}%` },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-4 text-primary" />
          Execution Status
        </CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{m.completedToday} completed today</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">{t.label}</p>
              <p className="mt-1 text-lg font-bold tabular-nums">{t.value}</p>
            </div>
          ))}
        </div>
        <Link
          href="/director/execution-center"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Execution Center
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
