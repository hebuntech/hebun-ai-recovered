import { FlaskConical, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { sampleSimulationSession, simulationEnvironment } from "@/features/adapters";

export function AdapterSimulation() {
  const session = sampleSimulationSession;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="size-4 text-primary" />
          Simulation
        </CardTitle>
        <Badge variant="info">{simulationEnvironment.mode}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-fg-secondary">
          The Simulation Adapter never accesses external systems and never executes real work.
          It returns deterministic mock execution so the pipeline can be validated end-to-end.
        </p>

        <div className="rounded-md border bg-surface-sunken p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-fg">{session.request.action}</span>
            <Badge variant={session.stage === "Completed" ? "success" : "error"}>{session.stage}</Badge>
          </div>
          <p className="mt-1 text-xs text-fg-muted">
            {session.request.capability} · {session.result?.outputSummary}
          </p>
        </div>

        <ol className="flex flex-col">
          {session.events.map((e, i) => (
            <li key={e.id} className="flex flex-col">
              <div className={cn("rounded-md border bg-surface p-3")}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-fg">{e.type}</span>
                  <span className="text-xs tabular-nums text-fg-muted">{e.timestamp}</span>
                </div>
                <p className="text-xs text-fg-secondary">{e.summary}</p>
              </div>
              {i < session.events.length - 1 && (
                <span className="flex h-5 items-center justify-center text-fg-muted">
                  <ArrowDown className="size-4" />
                </span>
              )}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
