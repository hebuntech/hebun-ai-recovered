import { ItemList } from "@/components/director-dashboard/item-list";
import { SectionShell } from "@/components/director-dashboard/section-shell";
import type { DirectorDashboardSnapshot } from "@/features/director-dashboard/foundation";

interface DirectorInsightsSectionProps {
  items: DirectorDashboardSnapshot["directorInsights"];
}

export function DirectorInsightsSection({ items }: DirectorInsightsSectionProps) {
  return (
    <SectionShell
      title="Director Insights"
      description="Deterministic executive guidance generated from live runtime context, not chat prompts."
      eyebrow="Director AI"
      href="/director/intelligence/insights"
      ctaLabel="Open insights"
    >
      <ItemList items={items} />
    </SectionShell>
  );
}
