import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generatedPlans, latestGeneratedPlan } from "@/features/planning";
import { PlanningBlueprint } from "@/components/planning/planning-blueprint";
import { PlanningDependencies } from "@/components/planning/planning-dependencies";
import { PlanningGoals } from "@/components/planning/planning-goals";
import { PlanningMilestones } from "@/components/planning/planning-milestones";
import { PlanningPipelineView } from "@/components/planning/planning-pipeline";
import { PlanningResources } from "@/components/planning/planning-resources";
import { PlanningRisk } from "@/components/planning/planning-risk";
import { PlanningSummary } from "@/components/planning/planning-summary";
import { PlanningTasks } from "@/components/planning/planning-tasks";
import { PlanningTimeline } from "@/components/planning/planning-timeline";

export function PlanningPanel() {
  const plan = latestGeneratedPlan();
  if (!plan) return null;

  return (
    <div className="grid grid-cols-12 gap-6">
      <PlanningSummary />

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Planning Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-fg-secondary">
              The Planning Engine turns approved decisions into structured, dependency-aware, resource-aware execution plans. It does not execute anything. It only produces explainable plans and reusable blueprints for future orchestrators.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <PlanningPipelineView />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <PlanningGoals plan={plan} />
      </div>
      <div className="col-span-12 xl:col-span-7">
        <PlanningTasks plan={plan} />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <PlanningDependencies plan={plan} />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <PlanningTimeline plan={plan} />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <PlanningResources plan={plan} />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <PlanningMilestones plan={plan} />
      </div>

      <div className="col-span-12">
        <PlanningBlueprint plan={plan} />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <PlanningRisk plan={plan} />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <Card>
          <CardHeader>
            <CardTitle>Success Criteria</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {plan.successCriteria.map((criterion) => (
              <div key={criterion.id} className="rounded-md border bg-surface-sunken p-4">
                <p className="text-sm font-semibold text-fg">{criterion.label}</p>
                <p className="mt-1 text-sm text-fg-secondary">{criterion.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Generated Plans</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {generatedPlans.map((item) => (
              <div key={item.id} className="rounded-md border bg-surface-sunken p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-fg">{item.title}</p>
                  <p className="text-sm text-fg-secondary">{item.status}</p>
                </div>
                <p className="mt-1 text-sm text-fg-secondary">{item.description}</p>
                <p className="mt-2 text-xs text-fg-muted">
                  {item.estimatedDuration} · {item.tasks.length} tasks · confidence {item.confidence}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
