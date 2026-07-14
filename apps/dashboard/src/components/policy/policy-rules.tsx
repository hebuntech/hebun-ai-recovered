import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GovernanceResult } from "@/features/policy";

export function PolicyRules({ result }: { result: GovernanceResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Applicable Policies</CardTitle>
        <span className="text-xs text-fg-muted">
          active policy rules evaluated against the reasoning result
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {result.policyResults.map((policy) => (
          <div key={policy.policyId} className="rounded-md border bg-surface-sunken p-4">
            <p className="text-sm font-semibold text-fg">{policy.policyName}</p>
            <p className="mt-1 text-sm text-fg-secondary">{policy.detail}</p>
            <p className="mt-2 text-xs text-fg-muted">
              {policy.category} · {policy.status}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
