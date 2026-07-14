import { Compass } from "lucide-react";
import { ItemList } from "@/components/director-dashboard/item-list";
import { MetricGrid } from "@/components/director-dashboard/metric-grid";
import { SectionShell } from "@/components/director-dashboard/section-shell";
import { EmptyState } from "@/components/ui/empty-state";
import type { DirectorDashboardSnapshot } from "@/features/director-dashboard/foundation";

interface AITransformationSectionProps {
  transformation: DirectorDashboardSnapshot["aiTransformation"];
}

export function AITransformationSection({ transformation }: AITransformationSectionProps) {
  return (
    <SectionShell
      title="AI Transformation"
      description="Read-only assessment of how prepared the organization is to operate as an AI-native company."
      eyebrow="Transformation"
      href="/director/intelligence/recommendations"
      ctaLabel="Open transformation"
    >
      <div className="space-y-5">
        <MetricGrid metrics={transformation.metrics} />
        {transformation.empty ? (
          <EmptyState
            title="Transformation evidence is still insufficient"
            description="Hebun will surface maturity, gaps, and proposed initiatives here once the runtime provides enough truthful organizational evidence."
            icon={<Compass className="size-5" />}
            eyebrow="Meaningful empty state"
          />
        ) : (
          <div className="space-y-5">
            <ItemList items={transformation.gaps} />
            <ItemList items={transformation.initiatives} />
          </div>
        )}
      </div>
    </SectionShell>
  );
}
