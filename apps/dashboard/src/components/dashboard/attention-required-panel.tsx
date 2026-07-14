import Link from "next/link";
import { ArrowRight, AlertTriangle, ShieldAlert } from "lucide-react";
import { AlertFeed } from "@/components/director/alert-feed";
import { DataStateBadge } from "@/components/dashboard/data-state-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { criticalAlerts, governanceStatus, executionStatusCounts } from "@/features/director/mock";

const summaryCards = [
  {
    label: "Critical escalations",
    value: `${criticalAlerts.filter((alert) => alert.escalation === "critical").length}`,
    caption: "Immediate review",
  },
  {
    label: "Open approvals",
    value: `${governanceStatus.pendingApprovals}`,
    caption: "Director attention",
  },
  {
    label: "Blocked or failed",
    value: `${executionStatusCounts.blocked + executionStatusCounts.failed}`,
    caption: "Execution risk",
  },
];

export function AttentionRequiredPanel() {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-fg-muted">
            Attention Required
          </p>
          <h3 className="text-xl font-semibold leading-8 text-fg">What needs intervention now</h3>
          <p className="max-w-3xl text-sm leading-6 text-fg-secondary">
            A prioritized view of the issues most likely to impact approvals, compliance, and live
            operational flow.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DataStateBadge state="DERIVED" />
          <DataStateBadge state="MOCK" />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] xl:gap-6">
        <AlertFeed alerts={criticalAlerts.slice(0, 4)} />

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-warning" />
              Director Focus
            </CardTitle>
            <span className="text-xs leading-5 text-fg-muted">
              highest-risk areas in the next decision window
            </span>
          </CardHeader>
          <CardContent className="flex h-full flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {summaryCards.map((card) => (
                <div key={card.label} className="rounded-md border bg-surface-sunken p-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                    {card.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold tabular-nums">{card.value}</p>
                  <p className="mt-1 text-xs leading-5 text-fg-muted">{card.caption}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto space-y-3 rounded-lg border bg-surface-sunken p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-fg">Legal capacity remains the main bottleneck</p>
                  <p className="text-sm leading-6 text-fg-secondary">
                    Approvals and compliance evidence are the clearest blockers to enterprise
                    execution this cycle.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-sm">
                <Link
                  href="/approvals"
                  className="inline-flex items-center gap-1.5 font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
                >
                  Review approvals
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/director/runtime-activation"
                  className="inline-flex items-center gap-1.5 font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
                >
                  Inspect activation blockers
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
