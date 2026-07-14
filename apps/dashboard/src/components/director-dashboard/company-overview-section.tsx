import { MetricGrid } from "@/components/director-dashboard/metric-grid";
import { SectionShell } from "@/components/director-dashboard/section-shell";
import type { DirectorDashboardSnapshot } from "@/features/director-dashboard/foundation";

interface CompanyOverviewSectionProps {
  overview: DirectorDashboardSnapshot["companyOverview"];
}

export function CompanyOverviewSection({ overview }: CompanyOverviewSectionProps) {
  return (
    <SectionShell
      title="Company Overview"
      description="A compact executive read on the current runtime footprint of the organization."
      eyebrow="Overview"
    >
      <MetricGrid metrics={overview.metrics} />
    </SectionShell>
  );
}
