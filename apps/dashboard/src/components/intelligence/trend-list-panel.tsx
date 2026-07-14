import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { levelVariant, trendTone } from "@/components/intelligence/intelligence-tokens";
import type { TrendItem, Trend } from "@/features/intelligence/mock";

const trendIcon: Record<Trend, LucideIcon> = { up: TrendingUp, down: TrendingDown, flat: Minus };

/* Shared panel for risk trends (upIsGood=false) and opportunity trends (upIsGood=true). */
export function TrendListPanel({
  title,
  items,
  upIsGood,
}: {
  title: string;
  items: TrendItem[];
  upIsGood: boolean;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{items.length}</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.map((it) => {
          const TrendI = trendIcon[it.trend];
          return (
            <div key={it.id} className="flex items-start justify-between gap-3 rounded-md border bg-surface-sunken p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-fg">{it.label}</p>
                <p className="text-xs text-fg-secondary">{it.detail}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={levelVariant[it.level]}>{it.level}</Badge>
                <span className={cn("inline-flex items-center", trendTone(it.trend, upIsGood))}>
                  <TrendI className="size-4" />
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
