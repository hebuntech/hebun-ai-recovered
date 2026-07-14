import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { ExecutionSummary } from "@/components/execution/execution-summary";
import { ExecutionStatusCard } from "@/components/execution/execution-status-card";
import { ExecutionTable } from "@/components/execution/execution-table";
import { BottleneckPanel } from "@/components/execution/bottleneck-panel";
import { HumanInterventionQueue } from "@/components/execution/human-intervention-queue";
import { FailureCard } from "@/components/execution/failure-card";
import { executions, failures, executionMetrics } from "@/features/execution/mock";

export default function ExecutionCenterPage() {
  const active = executions.filter((e) => e.status !== "completed");
  const recentFailures = failures.slice(0, 2);

  return (
    <>
      <PageHeader
        title="Execution Center"
        context="Operational control for running work — what's live, stuck, failing or recovering."
        action={<Badge variant="success">Execution Health {executionMetrics.executionHealth}%</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        <ExecutionSummary />

        {/* Active executions + status */}
        <div className="col-span-12 xl:col-span-8">
          <ExecutionTable rows={active} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <ExecutionStatusCard />
        </div>

        {/* Bottlenecks + human queue */}
        <div className="col-span-12 xl:col-span-6">
          <BottleneckPanel />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <HumanInterventionQueue />
        </div>

        {/* Recent failures */}
        <div className="col-span-12">
          <h3 className="mb-1 text-sm font-semibold text-fg">Recent Failures</h3>
        </div>
        {recentFailures.map((f) => (
          <div key={f.id} className="col-span-12 xl:col-span-6">
            <FailureCard failure={f} />
          </div>
        ))}
      </div>
    </>
  );
}
