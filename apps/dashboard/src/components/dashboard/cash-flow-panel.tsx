import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { usdCompact } from "@/lib/format";
import { cashFlow as c } from "@/features/finance/mock";

const riskVariant: Record<"low" | "medium" | "high", BadgeVariant> = {
  low: "success",
  medium: "warning",
  high: "error",
};

export function CashFlowPanel() {
  const rows = [
    { label: "Current Cash", value: usdCompact(c.currentCash) },
    { label: "7-Day Forecast", value: usdCompact(c.forecast7d) },
    { label: "30-Day Forecast", value: usdCompact(c.forecast30d) },
    { label: "90-Day Forecast", value: usdCompact(c.forecast90d) },
    { label: "Daily Burn", value: usdCompact(c.dailyBurn) },
    { label: "Runway", value: `${c.runwayMonths} months` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow</CardTitle>
        <Badge variant={riskVariant[c.liquidityRisk]}>
          {c.liquidityRisk} liquidity risk
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between py-2.5 text-sm first:pt-0 last:pb-0"
          >
            <span className="text-fg-secondary">{r.label}</span>
            <span className="font-semibold tabular-nums text-fg">{r.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
