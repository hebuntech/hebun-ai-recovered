import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { strategyDefinitions } from "@/features/provider-routing";

export function RoutingStrategyList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Routing Strategies</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{strategyDefinitions.length} strategies</span>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {strategyDefinitions.map((s) => (
          <div key={s.strategy} className="flex flex-col gap-1.5 rounded-md border bg-surface-sunken p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-fg">{s.label}</span>
              <div className="flex gap-1">
                {s.multi && <Badge variant="info">multi</Badge>}
                {s.humanFirst && <Badge variant="warning">human</Badge>}
                {s.simulationOnly && <Badge variant="neutral">sim</Badge>}
              </div>
            </div>
            <p className="text-xs text-fg-muted">{s.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
