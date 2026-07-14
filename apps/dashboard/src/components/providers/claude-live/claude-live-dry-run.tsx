import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { claudeLiveRecord } from "@/features/providers/claude-live";

export function ClaudeLiveDryRun() {
  const dryRun = claudeLiveRecord.dryRun;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dry Run Result</CardTitle>
        <span className="text-xs text-fg-muted">request validation, cost estimate, telemetry preview, no API call</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Badge variant={dryRun.status === "ready" ? "success" : "warning"}>{dryRun.status}</Badge>
          <span className="text-xs text-fg-muted">{dryRun.estimatedLatencyMs}ms estimated latency</span>
        </div>
        <p className="text-sm text-fg-secondary">{dryRun.summary}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-md border bg-surface-sunken p-3 text-sm">
            <p className="text-xs uppercase tracking-wider text-fg-secondary">Input</p>
            <p className="mt-1 font-semibold text-fg">{dryRun.usageEstimate.inputTokens}</p>
          </div>
          <div className="rounded-md border bg-surface-sunken p-3 text-sm">
            <p className="text-xs uppercase tracking-wider text-fg-secondary">Output</p>
            <p className="mt-1 font-semibold text-fg">{dryRun.usageEstimate.outputTokens}</p>
          </div>
          <div className="rounded-md border bg-surface-sunken p-3 text-sm">
            <p className="text-xs uppercase tracking-wider text-fg-secondary">Total</p>
            <p className="mt-1 font-semibold text-fg">{dryRun.usageEstimate.totalTokens}</p>
          </div>
          <div className="rounded-md border bg-surface-sunken p-3 text-sm">
            <p className="text-xs uppercase tracking-wider text-fg-secondary">Cost</p>
            <p className="mt-1 font-semibold text-fg">${dryRun.usageEstimate.estimatedCostUsd}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
