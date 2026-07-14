import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { orgDepartments } from "@/features/organization/mock";
import { scoreTone } from "@/components/organization/org-tokens";

/* Overall = average of the 6 metrics (risk inverted). */
function overall(d: (typeof orgDepartments)[number]): number {
  return Math.round((d.health + d.capacity + d.efficiency + (100 - d.risk) + d.learning + d.governance + d.execution) / 7);
}

export function HealthMatrix() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Health Matrix</CardTitle>
        <span className="text-xs text-fg-muted">departments × metrics</span>
      </CardHeader>
      <CardContent className="p-0">
        <div className="ui-table-wrap">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-fg-muted">
                <th className="px-6 py-3 font-medium">Department</th>
                <th className="px-6 py-3 font-medium">Health</th>
                <th className="px-6 py-3 font-medium">Capacity</th>
                <th className="px-6 py-3 font-medium">Efficiency</th>
                <th className="px-6 py-3 font-medium">Risk</th>
                <th className="px-6 py-3 font-medium">Learning</th>
                <th className="px-6 py-3 font-medium">Governance</th>
                <th className="px-6 py-3 font-medium">Execution</th>
                <th className="px-6 py-3 font-medium">Overall</th>
              </tr>
            </thead>
            <tbody>
              {orgDepartments.map((d) => (
                <tr key={d.id} className="border-b last:border-0">
                  <td className="px-6 py-3 font-medium text-fg">{d.name}</td>
                  <td className={cn("px-6 py-3 tabular-nums font-medium", scoreTone(d.health))}>{d.health}</td>
                  <td className={cn("px-6 py-3 tabular-nums font-medium", scoreTone(d.capacity))}>{d.capacity}</td>
                  <td className={cn("px-6 py-3 tabular-nums font-medium", scoreTone(d.efficiency))}>{d.efficiency}</td>
                  <td className={cn("px-6 py-3 tabular-nums font-medium", scoreTone(d.risk, true))}>{d.risk}</td>
                  <td className={cn("px-6 py-3 tabular-nums font-medium", scoreTone(d.learning))}>{d.learning}</td>
                  <td className={cn("px-6 py-3 tabular-nums font-medium", scoreTone(d.governance))}>{d.governance}</td>
                  <td className={cn("px-6 py-3 tabular-nums font-medium", scoreTone(d.execution))}>{d.execution}</td>
                  <td className={cn("px-6 py-3 tabular-nums font-bold", scoreTone(overall(d)))}>{overall(d)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
