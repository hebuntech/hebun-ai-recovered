"use client";

import { cn } from "@/lib/utils";
import { agentStatusConfig, healthTone } from "@/components/organization/org-tokens";
import type { OrgAgent } from "@/features/organization/mock";

export function AgentMiniCard({ agent, onClick }: { agent: OrgAgent; onClick: () => void }) {
  const st = agentStatusConfig[agent.status];
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-2 rounded-md border bg-surface p-3 text-left transition-colors duration-(--dur-fast) hover:border-border-strong hover:bg-surface-raised"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary-subtle text-xs font-semibold text-primary">
            {agent.name.slice(0, 2).toUpperCase()}
          </span>
          <span className="truncate text-sm font-medium text-fg">{agent.name}</span>
        </div>
        <span className={cn("inline-flex items-center gap-1 text-xs font-medium", st.text)}>
          <span className={cn("size-1.5 rounded-full", st.dot)} />
          {st.label}
        </span>
      </div>
      <p className="truncate text-xs text-fg-secondary">{agent.currentTask}</p>
      <div className="flex items-center justify-between text-xs text-fg-muted">
        <span>queue {agent.queueSize} · {agent.model}</span>
        <span className={cn("font-medium tabular-nums", healthTone(agent.health))}>{agent.health}</span>
      </div>
    </button>
  );
}
