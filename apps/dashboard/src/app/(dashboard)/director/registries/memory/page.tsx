import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { MemoryRegistryWorkspace } from "@/components/memory/memory-registry-workspace";
import { MemoryRuntimeService } from "@/features/memory-runtime";

export default function MemoryRegistryPage() {
  const active = MemoryRuntimeService.getActiveCount();

  return (
    <>
      <PageHeader
        title="Memory Registry"
        context="First-class memory definitions managed through the Command Bus and the in-memory persistence adapter."
        action={<Badge variant="success">{active} active</Badge>}
      />
      <MemoryRegistryWorkspace />
    </>
  );
}
