import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { departmentHealth } from "@/features/director/mock";

/* risk score 0–100, lower is better → token color bands */
function riskCell(score: number): { bg: string; text: string; label: string } {
  if (score >= 40) return { bg: "bg-error/20", text: "text-error", label: "High" };
  if (score >= 28) return { bg: "bg-warning/20", text: "text-warning", label: "Elevated" };
  if (score >= 18) return { bg: "bg-info/15", text: "text-info", label: "Moderate" };
  return { bg: "bg-success/15", text: "text-success", label: "Low" };
}

export function RiskHeatmap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Heatmap</CardTitle>
        <span className="text-xs text-fg-muted">department risk score</span>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {departmentHealth.map((d) => {
          const c = riskCell(d.riskScore);
          return (
            <div key={d.id} className={cn("flex flex-col gap-1 rounded-md border p-3", c.bg)}>
              <span className="truncate text-xs font-medium text-fg">{d.name}</span>
              <span className={cn("text-lg font-bold tabular-nums", c.text)}>{d.riskScore}</span>
              <span className={cn("text-xs font-medium", c.text)}>{c.label}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
