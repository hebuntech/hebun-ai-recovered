import { Siren } from "lucide-react";
import { SectionShell } from "@/components/director-dashboard/section-shell";
import { SignalList } from "@/components/director-dashboard/signal-list";
import { EmptyState } from "@/components/ui/empty-state";
import type { DashboardSignal } from "@/features/director-dashboard/foundation";

interface AlertsRisksSectionProps {
  items: DashboardSignal[];
}

export function AlertsRisksSection({ items }: AlertsRisksSectionProps) {
  return (
    <SectionShell
      title="Alerts & Risks"
      description="Non-generative risk signals derived directly from current runtime state."
      eyebrow="Attention"
    >
      {items.length > 0 ? (
        <SignalList items={items} />
      ) : (
        <EmptyState
          title="No material alerts are currently visible"
          description="The dashboard will surface operating risks here when authoritative runtime data indicates attention is required."
          icon={<Siren className="size-5" />}
          eyebrow="Meaningful empty state"
        />
      )}
    </SectionShell>
  );
}
