import { QuickActions } from "@/components/dashboard/quick-actions";
import { AiOsStatus } from "@/components/dashboard/ai-os-status";
import { OrganizationHealthWidget } from "@/components/dashboard/organization-health-widget";
import { DataStateBadge } from "@/components/dashboard/data-state-badge";
import { ExecutiveSummaryPanel } from "@/components/director/executive-summary-panel";

export function CompanyStatusPanel() {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-fg-muted">
            Company Status
          </p>
          <h3 className="text-xl font-semibold leading-8 text-fg">Current company and platform posture</h3>
          <p className="max-w-3xl text-sm leading-6 text-fg-secondary">
            A calmer snapshot of company health, operating-system status, and the fastest safe next
            actions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DataStateBadge state="DERIVED" />
          <DataStateBadge state="MOCK" />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)] xl:gap-6">
        <ExecutiveSummaryPanel withLink={false} />
        <QuickActions />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] xl:gap-6">
        <AiOsStatus />
        <OrganizationHealthWidget />
      </div>
    </section>
  );
}
