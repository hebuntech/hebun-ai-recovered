import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { invocations } from "@/features/provider-invocation";

export function InvocationTelemetry() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Telemetry & Policies</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{invocations.length} invocations</span>
      </CardHeader>
      <CardContent className="ui-table-wrap">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="text-left text-fg-secondary">
              <th className="p-2">Request</th>
              <th className="p-2">Mode</th>
              <th className="p-2 text-right">Retry</th>
              <th className="p-2 text-right">Timeout</th>
              <th className="p-2 text-center">Rollback</th>
              <th className="p-2 text-center">Cancel</th>
              <th className="p-2 text-right">~Latency</th>
            </tr>
          </thead>
          <tbody>
            {invocations.map((inv) => (
              <tr key={inv.id} className="border-t">
                <td className="p-2 font-medium text-fg whitespace-nowrap">{inv.requestId}</td>
                <td className="p-2 text-fg-secondary">{inv.executionMode}</td>
                <td className="p-2 text-right tabular-nums">×{inv.retryPolicy.maxAttempts}</td>
                <td className="p-2 text-right tabular-nums">{inv.timeoutPolicy.timeoutMs}ms</td>
                <td className="p-2 text-center">
                  <Badge variant={inv.rollbackPolicy.enabled ? "info" : "neutral"}>
                    {inv.rollbackPolicy.enabled ? inv.rollbackPolicy.strategy : "none"}
                  </Badge>
                </td>
                <td className="p-2 text-center">
                  <Badge variant={inv.cancellationPolicy.cancellable ? "success" : "neutral"}>
                    {inv.cancellationPolicy.cancellable ? "yes" : "no"}
                  </Badge>
                </td>
                <td className="p-2 text-right tabular-nums">{inv.telemetry.estimatedLatencyMs}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
