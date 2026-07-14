import { Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Agent } from "@/types";

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Card className="transition-shadow duration-(--dur-fast) hover:shadow-md">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-primary-subtle text-primary">
              <Bot className="size-5" />
            </span>
            <div>
              <h3 className="text-sm font-semibold">{agent.name}</h3>
              <p className="text-xs text-fg-secondary">{agent.role}</p>
            </div>
          </div>
          <StatusBadge status={agent.status} pulse />
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="neutral">{agent.department}</Badge>
          <Badge variant="primary">{agent.version}</Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t pt-4 text-xs">
          <div>
            <p className="text-fg-muted">Tasks</p>
            <p className="font-semibold tabular-nums text-fg">{agent.tasksToday}</p>
          </div>
          <div>
            <p className="text-fg-muted">Cost today</p>
            <p className="font-semibold tabular-nums text-fg">
              ${agent.costToday.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-fg-muted">Last active</p>
            <p className="font-semibold text-fg">{agent.lastActive}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
