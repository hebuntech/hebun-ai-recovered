import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { usdCompact } from "@/lib/format";
import { budgetSummary as b } from "@/features/finance/mock";

export function BudgetPanel() {
  const overThreshold = b.usagePercent >= 85;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget</CardTitle>
        <span className="text-xs text-fg-muted">exhausts {b.forecastExhaustion}</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tabular-nums">
              {usdCompact(b.used)}
            </span>
            <span className="text-xs text-fg-muted">of {usdCompact(b.total)}</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
            <div
              className={cn(
                "h-full rounded-full",
                overThreshold ? "bg-warning" : "bg-(image:--gradient-primary)"
              )}
              style={{ width: `${b.usagePercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-fg-muted">Remaining</p>
            <p className="font-semibold tabular-nums text-fg">{usdCompact(b.remaining)}</p>
          </div>
          <div>
            <p className="text-xs text-fg-muted">Usage</p>
            <p className="font-semibold tabular-nums text-fg">{b.usagePercent}%</p>
          </div>
          <div>
            <p className="text-xs text-fg-muted">Over Budget</p>
            <p
              className={cn(
                "font-semibold tabular-nums",
                b.departmentsOverBudget > 0 ? "text-error" : "text-fg"
              )}
            >
              {b.departmentsOverBudget} dept
            </p>
          </div>
          <div>
            <p className="text-xs text-fg-muted">Forecast Exhaustion</p>
            <p className="font-semibold text-fg">{b.forecastExhaustion}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
