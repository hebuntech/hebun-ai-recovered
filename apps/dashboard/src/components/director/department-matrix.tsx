import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { departmentHealth, type Trend, type DepartmentHealth } from "@/features/director/mock";

const trendIcon: Record<Trend, LucideIcon> = { up: TrendingUp, down: TrendingDown, flat: Minus };
const trendTone: Record<Trend, string> = { up: "text-success", down: "text-error", flat: "text-fg-muted" };

const workloadTone: Record<DepartmentHealth["workload"], string> = {
  low: "text-info",
  balanced: "text-success",
  high: "text-warning",
  overloaded: "text-error",
};

function healthTone(v: number): string {
  if (v >= 90) return "text-success";
  if (v >= 80) return "text-info";
  if (v >= 70) return "text-warning";
  return "text-error";
}

export function DepartmentMatrix({ title = "Department Health" }: { title?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{departmentHealth.length} departments</span>
      </CardHeader>
      <CardContent className="p-0">
        <div className="ui-table-wrap">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-fg-muted">
                <th className="whitespace-nowrap px-4 py-3 font-medium">Department</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Health</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Capacity</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Efficiency</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Workload</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">AI Util</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Learning</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Risk</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {departmentHealth.map((d) => {
                const Trend = trendIcon[d.trend];
                return (
                  <tr key={d.id} className="border-b last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-fg">{d.name}</td>
                    <td className={cn("whitespace-nowrap px-4 py-3 font-semibold tabular-nums", healthTone(d.health))}>{d.health}</td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-fg-secondary">{d.capacity}%</td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-fg-secondary">{d.efficiency}</td>
                    <td className={cn("whitespace-nowrap px-4 py-3 font-medium capitalize", workloadTone[d.workload])}>{d.workload}</td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-fg-secondary">{d.aiUtilization}%</td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-fg-secondary">{d.learningScore}</td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-fg-secondary">{d.riskScore}</td>
                    <td className={cn("whitespace-nowrap px-4 py-3", trendTone[d.trend])}><Trend className="size-4" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
