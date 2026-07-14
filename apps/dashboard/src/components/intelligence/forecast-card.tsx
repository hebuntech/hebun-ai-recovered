import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendChart } from "@/components/intelligence/trend-chart";
import { forecastTone, trendTone } from "@/components/intelligence/intelligence-tokens";
import type { Forecast } from "@/features/intelligence/mock";

export function ForecastCard({ forecast }: { forecast: Forecast }) {
  const tone = forecastTone[forecast.kind];
  // cost down = good; others up = good
  const upIsGood = forecast.kind !== "cost";
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-fg">{forecast.label}</h3>
          <span className="text-xs text-fg-muted tabular-nums">{forecast.confidence}% conf</span>
        </div>

        <div className={cn(tone)}>
          <TrendChart series={forecast.series} height={44} />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="tabular-nums text-fg-secondary">{forecast.current}</span>
          <ArrowRight className="size-3.5 text-fg-muted" />
          <span className={cn("font-semibold tabular-nums", trendTone(forecast.trend, upIsGood))}>{forecast.projected}</span>
        </div>

        <p className="mt-auto border-t pt-3 text-xs text-fg-secondary">{forecast.note}</p>
      </CardContent>
    </Card>
  );
}
