import Link from "next/link";
import { ArrowRight, Network } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orchestrationMetrics } from "@/features/orchestration";

export function OrchestrationWidget() {
  const tiles = [
    { label: "Active Blueprints", value: `${orchestrationMetrics.activeBlueprints}` },
    { label: "Agent Assignments", value: `${orchestrationMetrics.agentAssignments}` },
    { label: "Human Handoffs", value: `${orchestrationMetrics.humanHandoffs}` },
    { label: "Blocked", value: `${orchestrationMetrics.blockedAssignments}` },
    { label: "Fallback", value: `${orchestrationMetrics.fallbackCoverage}%` },
    { label: "Health", value: `${orchestrationMetrics.orchestrationHealth}` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="size-4 text-primary" />
          Orchestration Engine
        </CardTitle>
        <span className="text-xs text-fg-muted">
          deterministic coordination layer between planning and future execution
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                {tile.label}
              </p>
              <p className="mt-1 text-sm font-bold text-fg">{tile.value}</p>
            </div>
          ))}
        </div>
        <Link
          href="/director/orchestration"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Orchestration Engine
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
