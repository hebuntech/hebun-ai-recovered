import { HealthIndicator } from "@/components/director-dashboard/health-indicator";
import { SectionShell } from "@/components/director-dashboard/section-shell";
import type { DashboardHealthRow } from "@/features/director-dashboard/foundation";

interface OrganizationalHealthSectionProps {
  items: DashboardHealthRow[];
}

export function OrganizationalHealthSection({ items }: OrganizationalHealthSectionProps) {
  return (
    <SectionShell
      title="Organizational Health"
      description="Department health derived from current agent posture, workflow reliability, and live operating load."
      eyebrow="Health"
      href="/director/organization-health"
      ctaLabel="Open health view"
    >
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 border-b border-border pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium leading-6 text-fg">{item.label}</p>
              <p className="text-sm leading-6 text-fg-secondary">{item.detail}</p>
              <p className="text-xs leading-5 text-fg-muted">{item.trend}</p>
            </div>
            <HealthIndicator score={item.score} />
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
