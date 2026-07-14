import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GovernanceResult } from "@/features/policy";

export function PolicyExplanation({ result }: { result: GovernanceResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Decision Explanation</CardTitle>
        <span className="text-xs text-fg-muted">
          human-readable governance trace
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-fg-secondary">{result.explanation.summary}</p>
        <div className="grid gap-3 xl:grid-cols-2">
          <div className="rounded-md border bg-surface-sunken p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
              Policy Trace
            </p>
            <div className="mt-2 flex flex-col gap-2 text-sm text-fg-secondary">
              {result.explanation.policyTrace.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
          <div className="rounded-md border bg-surface-sunken p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
              Approval Trace
            </p>
            <div className="mt-2 flex flex-col gap-2 text-sm text-fg-secondary">
              {result.explanation.approvalTrace.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
