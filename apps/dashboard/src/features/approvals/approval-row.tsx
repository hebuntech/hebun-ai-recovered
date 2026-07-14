import { Card, CardContent } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { CommandAction } from "@/components/command/command-action";
import type { Approval, ApprovalRisk } from "@/types";

const riskVariant: Record<ApprovalRisk, BadgeVariant> = {
  low: "neutral",
  medium: "info",
  high: "warning",
  critical: "error",
};

export function ApprovalRow({ approval }: { approval: Approval }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{approval.title}</h3>
            <Badge variant={riskVariant[approval.risk]}>
              {approval.risk} risk
            </Badge>
            <Badge variant="neutral">{approval.type}</Badge>
          </div>
          <p className="text-sm text-fg-secondary">{approval.summary}</p>
          <p className="text-xs text-fg-muted">
            Requested by {approval.requestedBy} · {approval.createdAt}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <CommandAction
            label="Reject"
            commandType="approval.reject"
            title={`Reject — ${approval.title}`}
            variant="danger"
            size="sm"
            summary={`Record a rejection decision for "${approval.title}" and route it back to the requester.`}
          />
          <CommandAction
            label="Approve"
            commandType="approval.approve"
            title={`Approve — ${approval.title}`}
            variant="success"
            size="sm"
            summary={`Record an approval decision for "${approval.title}" and release it into execution.`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
