import { UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { priorityVariant } from "@/components/director/director-tokens";
import { execStatusConfig } from "@/components/execution/execution-tokens";
import type { ExecutionRecord } from "@/features/execution/mock";

export function ExecutionTable({ rows, title = "Active Executions" }: { rows: ExecutionRecord[]; title?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{rows.length} executions</span>
      </CardHeader>
      <CardContent className="p-0">
        <div className="ui-table-wrap">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-fg-muted">
                <th className="px-6 py-3 font-medium">Execution</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Owner</th>
                <th className="px-6 py-3 font-medium">Dept</th>
                <th className="px-6 py-3 font-medium">Priority</th>
                <th className="px-6 py-3 font-medium">Graph</th>
                <th className="px-6 py-3 font-medium">Retries</th>
                <th className="px-6 py-3 font-medium">Duration</th>
                <th className="px-6 py-3 font-medium">Human</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const s = execStatusConfig[r.status];
                return (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="px-6 py-3">
                      <span className="font-medium text-fg">{r.name}</span>
                      <span className="ml-2 font-mono text-xs text-fg-muted">{r.id}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", s.text)}>
                        <span className={cn("size-1.5 rounded-full", s.dot)} />
                        {s.label}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-fg-secondary">{r.owner}</td>
                    <td className="px-6 py-3 text-fg-secondary">{r.department}</td>
                    <td className="px-6 py-3"><Badge variant={priorityVariant[r.priority]}>{r.priority}</Badge></td>
                    <td className="px-6 py-3 tabular-nums text-fg-secondary">{r.nodesDone}/{r.nodesTotal}</td>
                    <td className="px-6 py-3 tabular-nums text-fg-secondary">{r.retryCount}</td>
                    <td className="px-6 py-3 tabular-nums text-fg-muted">{r.duration}</td>
                    <td className="px-6 py-3">
                      {r.humanRequired ? (
                        <UserCheck className="size-4 text-warning" />
                      ) : (
                        <span className="text-fg-muted">—</span>
                      )}
                    </td>
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
