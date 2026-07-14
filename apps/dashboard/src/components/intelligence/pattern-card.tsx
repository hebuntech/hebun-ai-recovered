import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/director/progress-bar";
import { cn } from "@/lib/utils";
import { patternStatusVariant, trendTone } from "@/components/intelligence/intelligence-tokens";
import type { Pattern, Trend } from "@/features/intelligence/mock";

const trendIcon: Record<Trend, LucideIcon> = { up: TrendingUp, down: TrendingDown, flat: Minus };

export function PatternCard({ pattern }: { pattern: Pattern }) {
  const TrendI = trendIcon[pattern.trend];
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-fg-muted">{pattern.category}</span>
            <h3 className="text-sm font-semibold text-fg">{pattern.name}</h3>
          </div>
          <Badge variant={patternStatusVariant[pattern.status]}>{pattern.status}</Badge>
        </div>

        <p className="text-sm text-fg-secondary">{pattern.businessImpact}</p>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-fg-muted">Confidence</span>
            <span className="font-medium tabular-nums text-fg-secondary">{pattern.confidence}%</span>
          </div>
          <ProgressBar value={pattern.confidence} />
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 border-t pt-3 text-xs text-fg-muted">
          <span className={cn("inline-flex items-center gap-1 font-medium", trendTone(pattern.trend, pattern.category !== "Compliance trend" && pattern.category !== "Financial trend"))}>
            <TrendI className="size-3.5" />
            {pattern.trend}
          </span>
          <span>· {pattern.frequency}</span>
          <span>· {pattern.departments.join(", ")}</span>
          <span className="ml-auto tabular-nums">{pattern.discovered}</span>
        </div>
      </CardContent>
    </Card>
  );
}
