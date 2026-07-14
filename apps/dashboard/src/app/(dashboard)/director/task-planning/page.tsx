import { ClipboardList, Rocket, ListVideo } from "lucide-react";
import { PlanningOverview } from "@/components/task-planning/planning-overview";
import { DispatchMonitor } from "@/components/live-dispatch/dispatch-monitor";
import { QueueMonitor } from "@/components/execution-queue/queue-monitor";
import { PageHeader } from "@/components/layout/page-header";

export default function TaskPlanningPage() {
  return (
    <>
      <PageHeader
        title="Task Planning Engine"
        context="The deterministic layer that turns every Decision Package into an Execution Plan — goals, tasks, dependencies, resources, approval gates, and timeline. It prepares execution; it never runs anything."
      />

      <div className="mb-6 flex items-center gap-2 text-sm text-fg-secondary">
        <ClipboardList className="size-4 text-primary" />
        Deterministic and traceable. No LLM calls, no execution, no orchestration, no command dispatch.
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-fg">Executive Planning Overview</h2>
        <p className="text-sm text-fg-secondary">
          Cross-agent read-only plan summary for the Director surface.
        </p>
      </div>

      <PlanningOverview />

      <div className="mb-4 mt-10 flex items-center gap-2">
        <Rocket className="size-4 text-primary" />
        <div>
          <h2 className="text-lg font-semibold text-fg">Executive Dispatch Monitor</h2>
          <p className="text-sm text-fg-secondary">
            Live internal command queue across agents — real Command Bus dispatch, fully offline.
          </p>
        </div>
      </div>

      <DispatchMonitor />

      <div className="mb-4 mt-10 flex items-center gap-2">
        <ListVideo className="size-4 text-primary" />
        <div>
          <h2 className="text-lg font-semibold text-fg">Executive Queue Monitor</h2>
          <p className="text-sm text-fg-secondary">
            Stateful execution queues across agents — validated lifecycle transitions, fully offline.
          </p>
        </div>
      </div>

      <QueueMonitor />
    </>
  );
}
