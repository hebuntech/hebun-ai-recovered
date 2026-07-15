import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { insights } from "@/features/director/mock";

const variants = { opportunity: "success", risk: "error", attention: "warning", cost: "info", learning: "primary" } as const;

export function ExecutiveInsightPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Executive Insights</CardTitle>
        <span className="text-xs text-fg-muted">{insights.length} active signals</span>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {insights.map((insight) => (
          <div key={insight.id} className="rounded-md border bg-surface-sunken p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-fg">{insight.title}</p>
              <Badge variant={variants[insight.kind]}>{insight.kind}</Badge>
            </div>
            <p className="mt-2 text-sm leading-6 text-fg-secondary">{insight.detail}</p>
            {insight.metric && <p className="mt-3 text-xs font-semibold text-fg">{insight.metric}</p>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
