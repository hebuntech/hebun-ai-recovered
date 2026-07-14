import { Badge } from "@/components/ui/badge";
import type { MemoryRecord } from "@/features/memory";

function importanceVariant(importance: MemoryRecord["importance"]) {
  if (importance === "critical") return "error";
  if (importance === "high") return "warning";
  if (importance === "medium") return "info";
  return "neutral";
}

export function MemoryDetail({ memory }: { memory: MemoryRecord }) {
  return (
    <div className="rounded-md border bg-surface-sunken p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-fg">{memory.title}</p>
          <p className="mt-1 text-sm text-fg-secondary">{memory.summary}</p>
        </div>
        <Badge variant={importanceVariant(memory.importance)}>{memory.importance}</Badge>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
            What Changed
          </p>
          <p className="mt-1 text-sm text-fg-secondary">{memory.whatChanged}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
            Reuse Later
          </p>
          <p className="mt-1 text-sm text-fg-secondary">{memory.reusableLater}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-fg-muted">
        {memory.category} · {memory.owner} · {memory.registryIds.length} registries ·{" "}
        {memory.graphNodeIds.length} graph nodes
      </p>
    </div>
  );
}
