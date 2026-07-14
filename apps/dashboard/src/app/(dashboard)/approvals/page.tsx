import { PageHeader } from "@/components/layout/page-header";
import { ApprovalRow } from "@/features/approvals/approval-row";
import { approvals } from "@/features/approvals/mock";

export default function ApprovalsPage() {
  return (
    <>
      <PageHeader
        title="Approvals"
        context={`${approvals.length} actions waiting for your decision`}
      />
      <div className="flex flex-col gap-4">
        {approvals.map((approval) => (
          <ApprovalRow key={approval.id} approval={approval} />
        ))}
      </div>
    </>
  );
}
