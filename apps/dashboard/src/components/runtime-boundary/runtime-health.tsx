import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { runtimeDecisions } from "@/features/runtime-boundary";

export function RuntimeHealth() {
  const seen = new Set<string>();
  const rows = runtimeDecisions.filter((d) => {
    const key = d.providerId ?? "none";
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Runtime Health</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{rows.length} providers</span>
      </CardHeader>
      <CardContent className="ui-table-wrap">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="text-left text-fg-secondary">
              <th className="p-2">Provider</th>
              <th className="p-2 text-right">Avail</th>
              <th className="p-2 text-right">Latency</th>
              <th className="p-2 text-right">Reliab</th>
              <th className="p-2 text-right">Prov Rdy</th>
              <th className="p-2 text-right">RT Rdy</th>
              <th className="p-2 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => {
              const h = d.runtimeHealth;
              return (
                <tr key={d.id} className="border-t">
                  <td className="p-2 font-medium text-fg whitespace-nowrap">{d.providerId ?? "—"}</td>
                  <td className="p-2 text-right tabular-nums">{h.availability}%</td>
                  <td className="p-2 text-right tabular-nums">{h.latencyMs}ms</td>
                  <td className="p-2 text-right tabular-nums">{h.reliability}</td>
                  <td className="p-2 text-right tabular-nums">{h.providerReadiness}</td>
                  <td className="p-2 text-right tabular-nums">{h.runtimeReadiness}</td>
                  <td className="p-2 text-right">
                    <Badge variant={h.healthy ? "success" : "warning"}>{h.score}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
