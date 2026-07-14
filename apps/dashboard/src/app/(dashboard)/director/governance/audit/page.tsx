import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { AuditTimeline } from "@/components/governance/audit-timeline";
import { auditEvents } from "@/features/governance/audit";

export default function GovernanceAuditPage() {
  const scopes = new Set(auditEvents.map((event) => event.scope)).size;

  return (
    <>
      <PageHeader
        title="Audit Center"
        context="Execution, approval, policy, permission and learning audit history."
        action={<Badge variant="info">{auditEvents.length} recent events</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-6 sm:col-span-3"><StatCard label="Audit Events" value={`${auditEvents.length}`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Scopes" value={`${scopes}`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Execution Audit" value={`${auditEvents.filter((event) => event.scope === "execution").length}`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Permission Audit" value={`${auditEvents.filter((event) => event.scope === "permission").length}`} /></div>

        <div className="col-span-12">
          <AuditTimeline />
        </div>
      </div>
    </>
  );
}
