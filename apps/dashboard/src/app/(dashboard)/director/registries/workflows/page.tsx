import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { WorkflowRegistryWorkspace } from "@/components/workflows/workflow-registry-workspace";
import { WorkflowRegistry } from "@/features/workflow-runtime";

export default function WorkflowRegistryPage() {
  const active = WorkflowRegistry.listWorkflows().length;

  return (
    <>
      <PageHeader
        title="Workflow Registry"
        context="First-class workflow definitions managed through the Command Bus and the in-memory persistence adapter."
        action={<Badge variant="success">{active} active</Badge>}
      />
      <WorkflowRegistryWorkspace showCards={false} />
    </>
  );
}
