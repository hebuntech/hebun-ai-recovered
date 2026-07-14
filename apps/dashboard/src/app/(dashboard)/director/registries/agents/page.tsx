import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { AgentRegistryWorkspace } from "@/components/agents/agent-registry-workspace";
import { buildReport } from "@/features/agent-crud";

export default function AgentRegistryPage() {
  const report = buildReport();

  return (
    <>
      <PageHeader
        title="Agent Registry"
        context="First-class agent definitions managed through the Command Bus and the in-memory persistence adapter."
        action={<Badge variant="success">{report.active} active</Badge>}
      />
      <AgentRegistryWorkspace showCards={false} />
    </>
  );
}
