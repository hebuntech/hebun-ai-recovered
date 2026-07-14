import { Workflow } from "lucide-react";
import { OfflineExecutionPanel } from "@/components/offline-execution/offline-execution-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { offlineExecutionMetrics } from "@/features/offline-execution";

export default function OfflineExecutionPage() {
  return (
    <>
      <PageHeader
        title="End-to-End Offline Execution"
        context="Proves the whole Hebun AI execution chain works from plan to simulated provider result without any live provider: Planning → Orchestration → Execution → Provider Routing → Provider Invocation → Runtime Boundary → Simulated Result → Audit. Deterministic, explainable, auditable and offline."
        action={<Badge variant={offlineExecutionMetrics.badge}>Pipeline {offlineExecutionMetrics.pipelineHealth}%</Badge>}
      />

      <div className="mb-6 flex items-center gap-2 text-sm text-fg-secondary">
        <Workflow className="size-4 text-primary" />
        No live execution, APIs, SDKs, credentials, network, shell, file mutation or LLM. Simulation
        enforced end-to-end; Future Live remains blocked.
      </div>

      <OfflineExecutionPanel />
    </>
  );
}
