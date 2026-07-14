import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { adapterDiagnostics, sdkConsumers } from "@/features/adapters";

function scoreTone(score: number): string {
  if (score >= 90) return "text-success";
  if (score >= 70) return "text-warning";
  return "text-error";
}

export function AdapterDiagnostics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SDK Diagnostics</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{adapterDiagnostics.length} adapters</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {adapterDiagnostics.map((d) => (
          <div key={d.adapterId} className="rounded-md border bg-surface-sunken p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-fg">{d.name}</span>
              <div className="flex items-center gap-2">
                <Badge variant={d.contract.complete ? "success" : "error"}>
                  {d.contract.complete ? "contract complete" : "incomplete"}
                </Badge>
                <span className={cn("text-sm font-bold tabular-nums", scoreTone(d.contract.score))}>{d.contract.score}</span>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <span className="text-fg-muted">Missing methods: <span className="text-fg-secondary">{d.contract.missingMethods.length}</span></span>
              <span className="text-fg-muted">Dup capabilities: <span className="text-fg-secondary">{d.contract.duplicateCapabilities.length}</span></span>
              <span className="text-fg-muted">Legal next: <span className="text-fg-secondary">{d.lifecycle.legalNext.length}</span></span>
              <span className="text-fg-muted">Circuit: <span className="text-fg-secondary capitalize">{d.circuit.state}</span></span>
            </div>
          </div>
        ))}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-muted">SDK Consumers (integration)</p>
          <div className="ui-table-wrap">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-fg-muted">
                  <th className="px-4 py-2 font-medium">Layer</th>
                  <th className="px-4 py-2 font-medium">Uses</th>
                  <th className="px-4 py-2 font-medium">Contract</th>
                </tr>
              </thead>
              <tbody>
                {sdkConsumers.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="px-4 py-2 font-medium text-fg">{c.layer}</td>
                    <td className="px-4 py-2 text-fg-secondary">{c.uses}</td>
                    <td className="px-4 py-2 font-mono text-xs text-fg-muted">{c.contract}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
