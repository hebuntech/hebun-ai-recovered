import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { HealthGauge } from "@/components/director/health-gauge";
import {
  companyHealth,
  executiveSummary,
  strategicGoals,
  executionStatusCounts,
  governanceStatus,
  learningStatus,
} from "@/features/director/mock";

function avg(nums: number[]): number {
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

export function ExecutiveSummaryPanel({ withLink = true }: { withLink?: boolean }) {
  const goalProgress = avg(strategicGoals.map((g) => g.progress));
  const activeExec = executionStatusCounts.running + executionStatusCounts.waiting + executionStatusCounts.retrying;

  const tiles = [
    { label: "Goal Progress", value: `${goalProgress}%` },
    { label: "Active Executions", value: `${activeExec}` },
    { label: "Pending Approvals", value: `${governanceStatus.pendingApprovals}` },
    { label: "Open Risks", value: `${governanceStatus.openRisks}` },
    { label: "Compliance", value: `${governanceStatus.complianceScore}%` },
    { label: "Adopted / wk", value: `${learningStatus.adoptedThisWeek}` },
  ];

  return (
    <Card>
      <CardContent className="@container flex flex-col gap-6 @4xl:flex-row @4xl:items-center">
        <div className="flex shrink-0 items-center gap-5">
          <HealthGauge value={companyHealth} size={120} />
          <div className="max-w-xs">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="size-3.5" />
              Executive Summary
            </span>
            <p className="mt-2 text-sm text-fg-secondary">{executiveSummary}</p>
          </div>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {tiles.map((t) => (
              <div key={t.label} className="rounded-md border bg-surface-sunken p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">{t.label}</p>
                <p className="mt-1 text-xl font-bold tabular-nums">{t.value}</p>
              </div>
            ))}
          </div>
          {withLink && (
            <Link
              href="/director"
              className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
            >
              Open Director Command Center
              <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
