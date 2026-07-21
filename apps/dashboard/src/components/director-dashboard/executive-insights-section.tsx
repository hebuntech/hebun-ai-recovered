import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionShell } from "@/components/director-dashboard/section-shell";
import type {
  ExecutiveInsight,
  InsightSeverity,
} from "@/features/director-dashboard-executive-insights";

const severityVariant: Record<InsightSeverity, BadgeVariant> = {
  healthy: "success",
  unknown: "neutral",
  warning: "warning",
  unavailable: "neutral",
  critical: "error",
};

export function ExecutiveInsightsSection({ insights }: { readonly insights: readonly ExecutiveInsight[] }) {
  return (
    <SectionShell
      title="Executive Insights"
      description="Why each section holds its current state, highest severity first."
      eyebrow="Executive Insights"
    >
      {insights.length === 0 ? (
        <EmptyState
          title="No insights are currently available"
          description="The current dashboard snapshot produced no sections to explain."
          eyebrow="empty"
          className="min-h-32 p-4"
        />
      ) : (
        <div className="divide-y divide-border">
          {insights.map((insight) => (
            <div key={insight.sectionId} className="space-y-1.5 py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="min-w-0 truncate text-sm font-medium text-fg">{insight.title}</p>
                <Badge variant={severityVariant[insight.severity]}>{insight.severity}</Badge>
              </div>
              <p className="text-sm text-fg-secondary">{insight.summary}</p>
              <p className="text-xs text-fg-muted">Next: {insight.recommendedAction}</p>
              <p className="text-[0.7rem] uppercase tracking-[0.12em] text-fg-muted">
                {insight.evidenceCount} evidence · {insight.evidenceSource}
              </p>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
