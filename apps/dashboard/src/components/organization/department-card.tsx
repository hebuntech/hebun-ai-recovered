"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Maximize2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AgentMiniCard } from "@/components/organization/agent-mini-card";
import { orgStatusVariant, healthTone } from "@/components/organization/org-tokens";
import { agentsForDepartment, type OrgDepartment, type OrgAgent } from "@/features/organization/mock";

interface DepartmentCardProps {
  dept: OrgDepartment;
  onAgentClick: (agent: OrgAgent) => void;
  onOpenDept: (dept: OrgDepartment) => void;
}

export function DepartmentCard({ dept, onAgentClick, onOpenDept }: DepartmentCardProps) {
  const [open, setOpen] = useState(false);
  const agents = agentsForDepartment(dept.id);

  const stats = [
    { label: "Capacity", value: `${dept.capacity}%` },
    { label: "Running", value: `${dept.runningTasks}` },
    { label: "Waiting", value: `${dept.waitingTasks}` },
    { label: "Done today", value: `${dept.completedToday}` },
    { label: "Approvals", value: `${dept.humanApprovals}` },
    { label: "Avg resp", value: dept.avgResponseTime },
  ];

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={cn("text-2xl font-bold tabular-nums", healthTone(dept.health))}>{dept.health}</span>
            <div>
              <h3 className="text-sm font-semibold text-fg">{dept.name}</h3>
              <div className="mt-0.5 flex items-center gap-2">
                <Badge variant={orgStatusVariant[dept.status]}>{dept.status}</Badge>
                <span className="text-xs text-fg-muted capitalize">{dept.workload} load</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenDept(dept)}
            className="rounded-md p-1 text-fg-muted transition-colors duration-(--dur-fast) hover:bg-surface-raised hover:text-fg"
            aria-label="Open department detail"
          >
            <Maximize2 className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="rounded-md border bg-surface-sunken p-2">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">{s.label}</p>
              <p className="text-sm font-semibold tabular-nums text-fg">{s.value}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          {open ? "Hide" : "Show"} {agents.length} agents
        </button>

        {open && (
          <div className="flex flex-col gap-2">
            {agents.map((a) => (
              <AgentMiniCard key={a.id} agent={a} onClick={() => onAgentClick(a)} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
