import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ExecutiveKpi } from "@/features/director/mock";

export function ExecutiveKpiCard({ kpi }: { kpi: ExecutiveKpi }) {
  const up = kpi.deltaDirection !== "down";
  return (
    <Card>
      <CardContent className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
          {kpi.label}
        </span>
        <span className="text-2xl font-bold tabular-nums">{kpi.value}</span>
        <div className="flex items-center gap-2 text-xs">
          {kpi.delta && (
            <span className={cn("inline-flex items-center gap-1 font-medium tabular-nums", up ? "text-success" : "text-error")}>
              {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {kpi.delta}
            </span>
          )}
          {kpi.caption && <span className="text-fg-muted">{kpi.caption}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
