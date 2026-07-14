import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ExecutionTable } from "@/components/director/execution-table";
import { DataStateBadge } from "@/components/dashboard/data-state-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { executions, executionStatusCounts } from "@/features/director/mock";

const activeExecutions = executions.filter((execution) => execution.status !== "completed").slice(0, 5);

const executionSummary = [
  { label: "Running", value: `${executionStatusCounts.running}` },
  { label: "Waiting", value: `${executionStatusCounts.waiting}` },
  { label: "Retrying", value: `${executionStatusCounts.retrying}` },
  { label: "Blocked", value: `${executionStatusCounts.blocked}` },
];

export function RunningExecutionsPanel() {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-fg-muted">
            Running Executions
          </p>
          <h3 className="text-xl font-semibold leading-8 text-fg">What is moving through the system now</h3>
          <p className="max-w-3xl text-sm leading-6 text-fg-secondary">
            Active runs stay visible, while the broader execution stack moves down into lower-priority
            inspection space.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DataStateBadge state="MOCK" />
          <DataStateBadge state="DERIVED" />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] xl:gap-6">
        <div className="min-w-0">
          <div className="md:hidden">
            <Card>
              <CardHeader>
                <CardTitle>Current execution queue</CardTitle>
                <span className="text-xs font-medium text-fg-muted">{activeExecutions.length} active runs</span>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {activeExecutions.map((execution) => (
                  <div key={execution.id} className="rounded-lg border bg-surface-sunken p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-fg">{execution.name}</p>
                        <p className="mt-1 font-mono text-xs text-fg-muted">{execution.id}</p>
                      </div>
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-fg-secondary">
                        {execution.status}
                      </p>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-fg-secondary">
                      <div>
                        <p className="uppercase tracking-[0.12em] text-fg-muted">Owner</p>
                        <p className="mt-1 text-sm text-fg">{execution.owner}</p>
                      </div>
                      <div>
                        <p className="uppercase tracking-[0.12em] text-fg-muted">Graph</p>
                        <p className="mt-1 text-sm text-fg">
                          {execution.nodesDone}/{execution.nodesTotal}
                        </p>
                      </div>
                      <div>
                        <p className="uppercase tracking-[0.12em] text-fg-muted">Priority</p>
                        <p className="mt-1 text-sm text-fg">{execution.priority}</p>
                      </div>
                      <div>
                        <p className="uppercase tracking-[0.12em] text-fg-muted">Duration</p>
                        <p className="mt-1 text-sm text-fg">{execution.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="hidden md:block">
            <ExecutionTable runs={activeExecutions} title="Current execution queue" />
          </div>
        </div>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Execution Snapshot</CardTitle>
            <span className="text-xs leading-5 text-fg-muted">
              topline state before drilling into execution detail
            </span>
          </CardHeader>
          <CardContent className="flex h-full flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {executionSummary.map((item) => (
                <div key={item.label} className="rounded-md border bg-surface-sunken p-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                    {item.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold tabular-nums">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto space-y-3 rounded-lg border bg-surface-sunken p-4">
              <p className="text-sm leading-6 text-fg-secondary">
                Execution remains mostly simulated, but the active queue still highlights the
                workflows most likely to stall approvals or require human follow-up.
              </p>
              <Link
                href="/director/execution"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
              >
                Open execution detail
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
