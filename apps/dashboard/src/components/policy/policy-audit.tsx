import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GovernanceResult } from "@/features/policy";

export function PolicyAudit({ result }: { result: GovernanceResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Trail</CardTitle>
        <span className="text-xs text-fg-muted">
          traceable deterministic audit record
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="rounded-md border bg-surface-sunken p-4">
          <p className="text-sm font-semibold text-fg">{result.auditRecord.summary}</p>
          <p className="mt-2 text-xs text-fg-muted">{result.auditRecord.owner}</p>
        </div>
        {result.auditRecord.trace.map((trace) => (
          <div key={trace} className="rounded-md border bg-surface-sunken p-3 text-sm text-fg-secondary">
            {trace}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
