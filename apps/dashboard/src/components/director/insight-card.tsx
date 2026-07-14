import { Lightbulb, TrendingUp, AlertTriangle, Eye, DollarSign, GraduationCap, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { insightTone, insightLabel } from "@/components/director/director-tokens";
import type { Insight, InsightKind } from "@/features/director/mock";

const insightIcon: Record<InsightKind, LucideIcon> = {
  opportunity: TrendingUp,
  risk: AlertTriangle,
  attention: Eye,
  cost: DollarSign,
  learning: GraduationCap,
};

export function InsightCard({ insight }: { insight: Insight }) {
  const Icon = insightIcon[insight.kind] ?? Lightbulb;
  const tone = insightTone[insight.kind];
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider", tone)}>
            <Icon className="size-4" />
            {insightLabel[insight.kind]}
          </span>
          {insight.metric && (
            <span className={cn("text-xs font-semibold tabular-nums", tone)}>{insight.metric}</span>
          )}
        </div>
        <h3 className="text-sm font-semibold text-fg">{insight.title}</h3>
        <p className="text-sm text-fg-secondary">{insight.detail}</p>
      </CardContent>
    </Card>
  );
}
