import { PageHeader } from "@/components/layout/page-header";
import { CommandAction } from "@/components/command/command-action";
import { WorkflowRegistryWorkspace } from "@/components/workflows/workflow-registry-workspace";
import { listAll } from "@/features/workflow-crud";

export default function WorkflowsPage() {
  const workflows = listAll();

  return (
    <>
      <PageHeader
        title="Workflows"
        context={`${workflows.length} workflows defined`}
        action={
          <CommandAction
            label="New Workflow"
            commandType="workflow.create"
            summary="Compose a new workflow — steps, dependencies, and execution triggers."
          />
        }
      />
      <WorkflowRegistryWorkspace />
    </>
  );
}
