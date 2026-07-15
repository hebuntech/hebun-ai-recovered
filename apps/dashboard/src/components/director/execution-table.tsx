import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExecutionRun, ExecutionStatus } from "@/features/director/mock";

const statusVariant: Record<ExecutionStatus, "success" | "warning" | "error" | "info" | "neutral"> = {
  running: "info",
  waiting: "warning",
  completed: "success",
  failed: "error",
  blocked: "error",
  retrying: "warning",
};

export function ExecutionTable({
  runs,
  title = "Execution Runs",
}: {
  runs: ExecutionRun[];
  title?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <span className="text-xs text-fg-muted">{runs.length} records</span>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b text-xs uppercase tracking-wider text-fg-muted">
            <tr>
              <th className="pb-3 font-medium">Execution</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Owner</th>
              <th className="pb-3 font-medium">Priority</th>
              <th className="pb-3 font-medium">Progress</th>
              <th className="pb-3 text-right font-medium">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {runs.map((run) => (
              <tr key={run.id}>
                <td className="py-3 pr-4">
                  <p className="font-medium text-fg">{run.name}</p>
                  <p className="font-mono text-xs text-fg-muted">{run.id}</p>
                </td>
                <td className="py-3 pr-4"><Badge variant={statusVariant[run.status]}>{run.status}</Badge></td>
                <td className="py-3 pr-4 text-fg-secondary">{run.owner}</td>
                <td className="py-3 pr-4 capitalize text-fg-secondary">{run.priority}</td>
                <td className="py-3 pr-4 tabular-nums text-fg-secondary">{run.nodesDone}/{run.nodesTotal}</td>
                <td className="py-3 text-right tabular-nums text-fg-secondary">{run.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
