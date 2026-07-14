import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { PolicyCard } from "@/components/governance/policy-card";
import { governancePolicies } from "@/features/governance/policies";

export default function GovernancePoliciesPage() {
  const active = governancePolicies.filter((item) => item.status === "active").length;
  const review = governancePolicies.filter((item) => item.status === "review").length;

  return (
    <>
      <PageHeader
        title="Policy Center"
        context="Business, AI, operational and department policies with versioned status."
        action={<Badge variant="primary">{active} active</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-6 sm:col-span-3"><StatCard label="Policies" value={`${governancePolicies.length}`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Active" value={`${active}`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="In Review" value={`${review}`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Versions" value={`${new Set(governancePolicies.map((item) => item.version)).size}`} /></div>

        {governancePolicies.map((policy) => (
          <div key={policy.id} className="col-span-12 sm:col-span-6 xl:col-span-4">
            <PolicyCard policy={policy} />
          </div>
        ))}
      </div>
    </>
  );
}
