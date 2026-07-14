import Link from "next/link";
import { ArrowRight, Workflow } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { offlineExecutionMetrics as m } from "@/features/offline-execution";

export function OfflineExecutionWidget() {
  const tiles = [
    { label: "Sessions", value: `${m.offlineSessions}` },
    { label: "Simulated", value: `${m.simulatedResults}` },
    { label: "Traceability", value: `${m.traceabilityScore}%` },
    { label: "Audit", value: `${m.auditCoverage}%` },
    { label: "Sim Enforced", value: `${m.simulationEnforcement}%` },
    { label: "Health", value: `${m.pipelineHealth}%` },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="size-4 text-primary" />
          End-to-End Offline Execution
        </CardTitle>
        <span className="text-xs text-fg-muted">plan → simulated provider result, fully offline</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">{t.label}</p>
              <p className="mt-1 text-sm font-bold text-fg tabular-nums">{t.value}</p>
            </div>
          ))}
        </div>
        <Link
          href="/director/offline-execution"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Offline Execution
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
