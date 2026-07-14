import { CommandAction } from "@/components/command/command-action";
import { PageHeader } from "@/components/layout/page-header";
import { MemoryRegistryWorkspace } from "@/components/memory/memory-registry-workspace";
import { MemoryEnginePanel } from "@/components/memory-engine/memory-engine-panel";
import { listAll } from "@/features/memory-crud";

export default function MemoryPage() {
  const memories = listAll();

  return (
    <>
      <PageHeader
        title="Memory"
        context={`${memories.length} memories defined`}
        action={
          <CommandAction
            label="New Memory"
            commandType="memory.create"
            summary="Create a new memory record with owner, type, summary, and lifecycle controls."
          />
        }
      />
      <div className="mb-6">
        <MemoryEnginePanel />
      </div>
      <MemoryRegistryWorkspace />
    </>
  );
}
