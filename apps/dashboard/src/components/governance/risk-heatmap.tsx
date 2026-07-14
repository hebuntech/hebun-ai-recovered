import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { governanceRisks } from "@/features/governance/risk";

function cellTone(score: number) {
  if (score >= 20) return "bg-error/15 text-error";
  if (score >= 16) return "bg-warning/15 text-warning";
  if (score >= 10) return "bg-info/15 text-info";
  return "bg-success/15 text-success";
}

export function RiskHeatmap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Heatmap</CardTitle>
        <span className="text-xs text-fg-muted">likelihood × impact</span>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {governanceRisks.map((risk) => {
          const score = risk.likelihood * risk.impact;
          return (
            <div key={risk.id} className={cn("rounded-md border p-4", cellTone(score))}>
              <p className="text-xs font-medium uppercase tracking-wider">{risk.category}</p>
              <p className="mt-1 text-sm font-semibold">{risk.title}</p>
              <p className="mt-3 text-2xl font-bold tabular-nums">{score}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
