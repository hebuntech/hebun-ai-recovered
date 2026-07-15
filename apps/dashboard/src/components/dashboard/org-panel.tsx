import { Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { AgentRegistry } from "@/features/agent-runtime";

export function OrgPanel() {
  const agents = AgentRegistry.listAgents();
  const departments = [...new Set(agents.map((agent) => agent.department?.label ?? "Organization"))]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({
      id: `dept-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name,
      agents: agents.filter((agent) => (agent.department?.label ?? "Organization") === name),
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Organization</CardTitle>
        <span className="text-xs text-fg-muted">
          {departments.length} departments · {agents.length} agents
        </span>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {departments.map((dept) => (
          <div key={dept.id} className="rounded-md border bg-surface-sunken p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">{dept.name}</span>
              <span className="text-xs tabular-nums text-fg-muted">
                {dept.agents.length} agent{dept.agents.length > 1 ? "s" : ""}
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {dept.agents.map((agent) => {
                return (
                  <li key={agent.identity.id} className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2 text-sm text-fg-secondary">
                      <Bot className="size-3.5 shrink-0 text-fg-muted" />
                      <span className="truncate">{agent.identity.name}</span>
                    </span>
                    <StatusBadge status={agent.status} className="shrink-0" />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
