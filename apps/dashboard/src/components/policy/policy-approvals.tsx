import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GovernanceResult } from "@/features/policy";

export function PolicyApprovals({ result }: { result: GovernanceResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Requirements</CardTitle>
        <span className="text-xs text-fg-muted">
          approval path required before planning review
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {result.approvalRequirements.map((approval, index) => (
          <div key={`${approval.mode}-${index}`} className="rounded-md border bg-surface-sunken p-4">
            <p className="text-sm font-semibold text-fg">{approval.mode}</p>
            <p className="mt-1 text-sm text-fg-secondary">{approval.detail}</p>
            <p className="mt-2 text-xs text-fg-muted">{approval.owner}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
