import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ComplianceArea } from "@/features/governance/types";

function TrendIcon({ trend }: { trend: ComplianceArea["trend"] }) {
  if (trend === "up") return <TrendingUp className="size-3" />;
  if (trend === "down") return <TrendingDown className="size-3" />;
  return <Minus className="size-3" />;
}

export function ComplianceCard({ item }: { item: ComplianceArea }) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-fg">{item.label}</h3>
            <p className="text-sm text-fg-secondary">{item.note}</p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              item.trend === "up" ? "text-success" : item.trend === "down" ? "text-error" : "text-fg-muted"
            )}
          >
            <TrendIcon trend={item.trend} />
            {item.trend}
          </span>
        </div>
        <div className="mt-auto text-3xl font-bold tabular-nums">{item.score}%</div>
      </CardContent>
    </Card>
  );
}
