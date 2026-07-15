import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentRegistry } from "@/features/agent-runtime";

export function CostSummary() {
  const agents = AgentRegistry.listAgents();
  const total = agents.reduce((sum, agent) => sum + agent.costToday, 0);
  const max = Math.max(1, ...agents.map((agent) => agent.costToday));
  const top = [...agents].sort((a, b) => b.costToday - a.costToday).slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Summary</CardTitle>
        <span className="text-xs text-fg-muted">today</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div>
          <span className="text-3xl font-bold tabular-nums">${total.toFixed(2)}</span>
          <span className="ml-2 text-xs text-success">−12% vs yesterday</span>
        </div>
        <ul className="flex flex-col gap-3">
          {top.map((agent) => (
            <li key={agent.identity.id} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-fg-secondary">{agent.identity.name}</span>
                <span className="font-medium tabular-nums text-fg">
                  ${agent.costToday.toFixed(2)}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
                <div
                  className="h-full rounded-full bg-(image:--gradient-primary)"
                  style={{ width: `${(agent.costToday / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
