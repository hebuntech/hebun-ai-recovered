import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { WorkflowRegistryWorkspace } from "@/components/workflows/workflow-registry-workspace";
import { buildReport } from "@/features/workflow-crud";

export default function WorkflowRegistryPage() {
  const report = buildReport();

  return (
    <>
      <PageHeader
        title="Workflow Registry"
        context="First-class workflow definitions managed through the Command Bus and the in-memory persistence adapter."
        action={<Badge variant="success">{report.active} active</Badge>}
      />
      <WorkflowRegistryWorkspace showCards={false} />
    </>
  );
}
