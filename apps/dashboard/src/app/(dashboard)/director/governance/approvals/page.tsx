import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ApprovalQueue } from "@/components/governance/approval-queue";
import { governanceApprovals } from "@/features/governance/approvals";

export default function GovernanceApprovalsPage() {
  const emergency = governanceApprovals.filter((item) => item.approvalLayer === "emergency").length;
  const executive = governanceApprovals.filter((item) => item.approvalLayer === "executive").length;
  const overdue = governanceApprovals.filter((item) => item.status === "escalated").length;

  return (
    <>
      <PageHeader
        title="Approval Center"
        context="Pending approvals, aging, ownership and escalation across the organization."
        action={<Badge variant="warning">{governanceApprovals.length} pending</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-6 sm:col-span-3"><StatCard label="Pending" value={`${governanceApprovals.length}`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Executive" value={`${executive}`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Emergency" value={`${emergency}`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Past SLA" value={`${overdue}`} /></div>

        <div className="col-span-12">
          <ApprovalQueue title="Department + Executive Approvals" />
        </div>
      </div>
    </>
  );
}
