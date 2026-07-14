import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { ExecutionTimeline } from "@/components/execution/execution-timeline";
import { timelineEvents } from "@/features/execution/mock";

export default function ExecutionTimelinePage() {
  return (
    <>
      <PageHeader
        title="Execution Timeline"
        context="Every step across executions — grouped by execution, department, status or severity."
        action={<Badge variant="primary">{timelineEvents.length} events</Badge>}
      />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <ExecutionTimeline />
        </div>
      </div>
    </>
  );
}
