import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  latestOrchestrationBlueprint,
  orchestrationBlueprints,
} from "@/features/orchestration";
import { OrchestrationAgents } from "@/components/orchestration/orchestration-agents";
import { OrchestrationApprovals } from "@/components/orchestration/orchestration-approvals";
import { OrchestrationAssignments } from "@/components/orchestration/orchestration-assignments";
import { OrchestrationDependencies } from "@/components/orchestration/orchestration-dependencies";
import { OrchestrationFallbacks } from "@/components/orchestration/orchestration-fallbacks";
import { OrchestrationHandoffs } from "@/components/orchestration/orchestration-handoffs";
import { OrchestrationHumans } from "@/components/orchestration/orchestration-humans";
import { OrchestrationParallelGroups } from "@/components/orchestration/orchestration-parallel-groups";
import { OrchestrationPipelineView } from "@/components/orchestration/orchestration-pipeline";
import { OrchestrationSummary } from "@/components/orchestration/orchestration-summary";
import { OrchestrationValidation } from "@/components/orchestration/orchestration-validation";

export function OrchestrationPanel() {
  const blueprint = latestOrchestrationBlueprint();
  if (!blueprint) return null;

  return (
    <div className="grid grid-cols-12 gap-6">
      <OrchestrationSummary />

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Orchestration Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-fg-secondary">
              The Multi-Agent Orchestrator Foundation receives execution-ready plans and determines ownership, sequencing, handoffs, approval gates, fallback coverage, and coordination strategy without executing any work.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <OrchestrationPipelineView />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <OrchestrationAssignments blueprint={blueprint} />
      </div>
      <div className="col-span-12 xl:col-span-5">
        <OrchestrationAgents blueprint={blueprint} />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <OrchestrationHumans blueprint={blueprint} />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <OrchestrationDependencies blueprint={blueprint} />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <OrchestrationParallelGroups blueprint={blueprint} />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <OrchestrationHandoffs blueprint={blueprint} />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <OrchestrationApprovals blueprint={blueprint} />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <OrchestrationFallbacks blueprint={blueprint} />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <OrchestrationValidation blueprint={blueprint} />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <Card>
          <CardHeader>
            <CardTitle>Orchestration Blueprint</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="text-sm font-semibold text-fg">{blueprint.coordinationStrategy}</p>
              <p className="mt-1 text-sm text-fg-secondary">{blueprint.explanation.summary}</p>
              <p className="mt-2 text-xs text-fg-muted">
                {blueprint.status} · confidence {blueprint.confidence}
              </p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                Capability Requirements
              </p>
              <div className="mt-2 flex flex-col gap-2 text-sm text-fg-secondary">
                {blueprint.capabilityRequirements.map((item) => (
                  <p key={item.taskId}>{item.summary}</p>
                ))}
              </div>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                Tool Requirements
              </p>
              <div className="mt-2 flex flex-col gap-2 text-sm text-fg-secondary">
                {blueprint.toolAssignments.map((item) => (
                  <p key={item.taskId}>{item.summary}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Blueprint History</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {orchestrationBlueprints.map((item) => (
              <div key={item.id} className="rounded-md border bg-surface-sunken p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-fg">{item.plan.title}</p>
                  <p className="text-sm text-fg-secondary">{item.status}</p>
                </div>
                <p className="mt-1 text-sm text-fg-secondary">{item.explanation.summary}</p>
                <p className="mt-2 text-xs text-fg-muted">
                  {item.coordinationStrategy} · {item.agentAssignments.length} agent assignments · {item.handoffs.length} handoffs
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
