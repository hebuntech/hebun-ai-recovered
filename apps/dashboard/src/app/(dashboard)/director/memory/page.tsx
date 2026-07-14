import { MemoryRegistryWorkspace } from "@/components/memory/memory-registry-workspace";
import { MemoryEnginePanel } from "@/components/memory-engine/memory-engine-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buildReport } from "@/features/memory-crud";

export default function MemoryPage() {
  const report = buildReport();

  return (
    <>
      <PageHeader
        title="Memory Registry"
        context="First-class memory definitions managed through the Command Bus and the in-memory persistence adapter."
        action={<Badge variant="success">{report.active} active</Badge>}
      />
      <div className="mb-6">
        <MemoryEnginePanel />
      </div>
      <MemoryRegistryWorkspace />
    </>
  );
}
