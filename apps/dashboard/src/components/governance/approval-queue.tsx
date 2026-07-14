import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { governancePriorityVariant } from "@/components/governance/governance-tokens";
import { governanceApprovals } from "@/features/governance/approvals";

export function ApprovalQueue({ title = "Approval Queue" }: { title?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <span className="text-xs text-fg-muted">{governanceApprovals.length} active items</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {governanceApprovals.map((approval) => (
          <div key={approval.id} className="rounded-md border bg-surface-sunken p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 flex-col gap-1">
                <h3 className="text-sm font-semibold text-fg">{approval.title}</h3>
                <p className="text-sm text-fg-secondary">{approval.summary}</p>
              </div>
              <Badge variant={governancePriorityVariant[approval.priority]}>{approval.priority}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-fg-muted">
              <span>{approval.department}</span>
              <span>·</span>
              <span>{approval.owner}</span>
              <span>·</span>
              <span>{approval.age} age</span>
              <span>·</span>
              <span>SLA {approval.sla}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
