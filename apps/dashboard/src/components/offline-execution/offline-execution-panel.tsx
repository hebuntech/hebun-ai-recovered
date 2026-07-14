import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OfflineExecutionSummary } from "@/components/offline-execution/offline-execution-summary";
import { OfflineExecutionPipeline } from "@/components/offline-execution/offline-execution-pipeline";
import { OfflineExecutionSessionView } from "@/components/offline-execution/offline-execution-session";
import { OfflineExecutionTasks } from "@/components/offline-execution/offline-execution-tasks";
import { OfflineProviderRoutes } from "@/components/offline-execution/offline-provider-routes";
import { OfflineInvocations } from "@/components/offline-execution/offline-invocations";
import { OfflineRuntimeDecisions } from "@/components/offline-execution/offline-runtime-decisions";
import { OfflineResults } from "@/components/offline-execution/offline-results";
import { OfflineTelemetry } from "@/components/offline-execution/offline-telemetry";
import { OfflineAudit } from "@/components/offline-execution/offline-audit";
import { OfflineReport } from "@/components/offline-execution/offline-report";
import { offlineSafetyBoundaries } from "@/features/offline-execution";

export function OfflineExecutionPanel() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <OfflineExecutionSummary />

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>End-to-End Offline Execution</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-fg-secondary">
              This pipeline proves the whole Hebun AI execution chain works from plan to simulated
              provider result without any live provider: Planning → Orchestration → Execution →
              Provider Routing → Provider Invocation → Runtime Boundary → Simulated Result → Audit.
              Deterministic, explainable, auditable and offline. No live execution, provider APIs,
              SDKs, credentials, network, shell, file mutation or LLM. Future Live stays blocked.
            </p>
            <ul className="flex flex-col gap-1">
              {offlineSafetyBoundaries.map((c) => (
                <li key={c} className="text-xs text-fg-muted">· {c}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <OfflineExecutionPipeline />
      </div>

      <div className="col-span-12">
        <OfflineExecutionSessionView />
      </div>

      <div className="col-span-12">
        <OfflineExecutionTasks />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <OfflineProviderRoutes />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <OfflineInvocations />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <OfflineRuntimeDecisions />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <OfflineTelemetry />
      </div>

      <div className="col-span-12">
        <OfflineResults />
      </div>

      <div className="col-span-12">
        <OfflineReport />
      </div>

      <div className="col-span-12">
        <OfflineAudit />
      </div>
    </div>
  );
}
