import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { SectionShell } from "@/components/director-dashboard/section-shell";
import type {
  ExecutiveHealthState,
  ExecutiveOverview,
} from "@/features/director-dashboard-executive-overview";

const healthVariant: Record<ExecutiveHealthState, BadgeVariant> = {
  healthy: "success",
  unknown: "neutral",
  warning: "warning",
  unavailable: "neutral",
  critical: "error",
};

const healthCopy: Record<ExecutiveHealthState, string> = {
  healthy: "All observed systems are operating normally.",
  unknown: "Not enough evidence to judge company health.",
  warning: "Some systems need attention.",
  unavailable: "Company health cannot be observed right now.",
  critical: "Critical issues require immediate attention.",
};

const freshnessCopy = {
  fresh: "Snapshot is current.",
  stale: "Snapshot is older than the freshness threshold.",
  unknown: "Snapshot age is unknown.",
} as const;

export function ExecutiveOverviewSection({ overview, navigableSectionIds, onOpenSection }: {
  readonly overview: ExecutiveOverview;
  /** Sections that can be opened as a record list. Omit to render statically. */
  readonly navigableSectionIds?: readonly string[];
  readonly onOpenSection?: (sectionId: string) => void;
}) {
  return (
    <SectionShell
      title="Executive Overview"
      description={healthCopy[overview.organizationHealth]}
      eyebrow="Executive Overview"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={healthVariant[overview.organizationHealth]}>
            Organization {overview.organizationHealth}
          </Badge>
          <Badge variant={overview.criticalAlertCount > 0 ? "error" : "neutral"}>
            {overview.criticalAlertCount} critical
          </Badge>
          <Badge variant={overview.warningCount > 0 ? "warning" : "neutral"}>
            {overview.warningCount} warning
          </Badge>
          <Badge variant={overview.unavailableCount > 0 ? "warning" : "neutral"}>
            {overview.unavailableCount} unavailable
          </Badge>
          <Badge variant={overview.freshness.state === "fresh" ? "success" : "neutral"}>
            Snapshot {overview.freshness.state}
          </Badge>
          <span className="text-sm text-fg-secondary">{freshnessCopy[overview.freshness.state]}</span>
        </div>
        <div className="grid gap-x-6 divide-y divide-border sm:grid-cols-2 sm:divide-y-0">
          {overview.sections.map((section) => {
            const openable = Boolean(onOpenSection) && (navigableSectionIds ?? []).includes(section.sectionId);
            const body = (
              <>
                <div className="min-w-0 text-left">
                  <p className="truncate text-sm font-medium text-fg">{section.label}</p>
                  <p className="text-xs text-fg-muted">{section.recordCount} records</p>
                </div>
                <Badge variant={healthVariant[section.health]}>{section.health}</Badge>
              </>
            );
            const shared = "flex w-full items-center justify-between gap-3 py-2 sm:border-b sm:border-border";
            return openable ? (
              <button
                key={section.sectionId}
                type="button"
                onClick={() => onOpenSection?.(section.sectionId)}
                aria-label={`Open ${section.label} records`}
                className={`${shared} rounded-md text-left transition-colors hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ring`}
              >
                {body}
              </button>
            ) : (
              <div key={section.sectionId} className={shared}>{body}</div>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
