import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { MemoryRegistryWorkspace } from "@/components/memory/memory-registry-workspace";
import { buildReport } from "@/features/memory-crud";

export default function MemoryRegistryPage() {
  const report = buildReport();

  return (
    <>
      <PageHeader
        title="Memory Registry"
        context="First-class memory definitions managed through the Command Bus and the in-memory persistence adapter."
        action={<Badge variant="success">{report.active} active</Badge>}
      />
      <MemoryRegistryWorkspace />
    </>
  );
}
