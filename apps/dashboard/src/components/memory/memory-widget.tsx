import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSnapshot, toWidgetMetrics } from "@/features/memory-crud";

export function MemoryWidget() {
  const metrics = toWidgetMetrics(getSnapshot());
  const tiles = [
    { label: "Total Memories", value: `${metrics.total}` },
    { label: "Decisions", value: `${metrics.decisions}` },
    { label: "Facts", value: `${metrics.facts}` },
    { label: "Procedures", value: `${metrics.procedures}` },
    { label: "Organizations", value: `${metrics.organizations}` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="size-4 text-primary" />
          Memory
        </CardTitle>
        <span className="text-xs text-fg-muted">
          persistent organizational memory layer
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                {tile.label}
              </p>
              <p className="mt-1 text-lg font-bold tabular-nums">{tile.value}</p>
            </div>
          ))}
        </div>
        <Link
          href="/director/memory"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Memory Registry
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
