import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeneratedPlan } from "@/features/planning";

interface PlanningBlueprintProps {
  plan: GeneratedPlan;
}

export function PlanningBlueprint({ plan }: PlanningBlueprintProps) {
  const blueprint = plan.executionBlueprint;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Blueprint</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 xl:grid-cols-2">
        <div className="rounded-md border bg-surface-sunken p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
            Ordered Tasks
          </p>
          <div className="mt-2 flex flex-col gap-2 text-sm text-fg-secondary">
            {blueprint.orderedTasks.map((task) => (
              <p key={task}>{task}</p>
            ))}
          </div>
        </div>
        <div className="rounded-md border bg-surface-sunken p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
            Parallel Tasks
          </p>
          <div className="mt-2 flex flex-col gap-2 text-sm text-fg-secondary">
            {blueprint.parallelTasks.map((group) => (
              <p key={group.join("|")}>{group.join(" + ")}</p>
            ))}
          </div>
        </div>
        <div className="rounded-md border bg-surface-sunken p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
            Critical Path
          </p>
          <div className="mt-2 flex flex-col gap-2 text-sm text-fg-secondary">
            {blueprint.criticalPath.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
        <div className="rounded-md border bg-surface-sunken p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
            Approval Checkpoints
          </p>
          <div className="mt-2 flex flex-col gap-2 text-sm text-fg-secondary">
            {blueprint.approvalCheckpoints.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
        <div className="rounded-md border bg-surface-sunken p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
            Decision Points
          </p>
          <div className="mt-2 flex flex-col gap-2 text-sm text-fg-secondary">
            {blueprint.decisionPoints.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
        <div className="rounded-md border bg-surface-sunken p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
            Rollback Points
          </p>
          <div className="mt-2 flex flex-col gap-2 text-sm text-fg-secondary">
            {blueprint.rollbackPoints.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
