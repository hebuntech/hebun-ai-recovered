import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExecutionEvents } from "@/components/execution/execution-events";
import { ExecutionHistory } from "@/components/execution/execution-history";
import { ExecutionMonitorCard } from "@/components/execution/execution-monitor";
import { ExecutionPipelineView } from "@/components/execution/execution-pipeline";
import { ExecutionRetries } from "@/components/execution/execution-retries";
import { ExecutionRollbacks } from "@/components/execution/execution-rollbacks";
import { ExecutionSessions } from "@/components/execution/execution-sessions";
import { ExecutionStateCard } from "@/components/execution/execution-state";
import { ExecutionSummary } from "@/components/execution/execution-summary";
import { ExecutionTelemetryCard } from "@/components/execution/execution-telemetry";
import { latestExecutionSession } from "@/features/execution";

export function ExecutionPanel() {
  const session = latestExecutionSession();
  if (!session) return null;

  return (
    <div className="grid grid-cols-12 gap-6">
      <ExecutionSummary />

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Execution Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-fg-secondary">
              The execution engine receives orchestration blueprints, creates deterministic execution sessions, tracks lifecycle state, manages retries, failures, cancellations, rollbacks, and telemetry, and remains provider-independent until future execution adapters exist.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <ExecutionPipelineView />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <ExecutionSessions />
      </div>
      <div className="col-span-12 xl:col-span-5">
        <ExecutionStateCard />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <ExecutionEvents />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <ExecutionMonitorCard />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <ExecutionRetries />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <ExecutionRollbacks />
      </div>

      <div className="col-span-12">
        <ExecutionTelemetryCard />
      </div>

      <div className="col-span-12">
        <ExecutionHistory />
      </div>
    </div>
  );
}
