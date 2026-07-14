import { cn } from "@/lib/utils";
import { nodeStateConfig } from "@/components/execution/execution-tokens";
import type { ExecutionNode as ExecNode } from "@/features/execution/mock";

export function ExecutionNode({ node }: { node: ExecNode }) {
  const s = nodeStateConfig[node.state];
  return (
    <div className={cn("rounded-md border bg-surface p-4", s.border)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={cn("size-2.5 rounded-full", s.dot)} />
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-fg-muted">{node.type}</span>
            <p className="text-sm font-medium text-fg">{node.label}</p>
          </div>
        </div>
        <span className={cn("text-xs font-medium", s.text)}>{s.label}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
        <span className="text-fg-muted">Owner: <span className="text-fg-secondary">{node.owner}</span></span>
        <span className="text-fg-muted">Duration: <span className="tabular-nums text-fg-secondary">{node.duration}</span></span>
        <span className="text-fg-muted">Retries: <span className="tabular-nums text-fg-secondary">{node.retryCount}</span></span>
        <span className="text-fg-muted">Cost: <span className="tabular-nums text-fg-secondary">{node.cost}</span></span>
        <span className="text-fg-muted">Started: <span className="tabular-nums text-fg-secondary">{node.startedAt}</span></span>
        <span className="text-fg-muted">Completed: <span className="tabular-nums text-fg-secondary">{node.completedAt}</span></span>
        <span className="col-span-2 text-fg-muted">Event: <span className="font-mono text-fg-secondary">{node.relatedEvent}</span></span>
      </div>
    </div>
  );
}
