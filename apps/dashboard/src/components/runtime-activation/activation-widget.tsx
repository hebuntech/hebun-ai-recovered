import Link from "next/link";
import { ArrowRight, Power } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { activationMetrics as m } from "@/features/runtime-activation";

export function ActivationWidget() {
  const tiles = [
    { label: "Activation Health", value: `${m.activationHealth}%` },
    { label: "Simulation", value: `${m.simulationCount}` },
    { label: "Live Ready", value: `${m.liveReadyCount}` },
    { label: "Blocked", value: `${m.blockedCount}` },
    { label: "Approval", value: `${m.approvalPendingCount}` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Power className="size-4 text-primary" />
          Runtime Activation
        </CardTitle>
        <span className="text-xs text-fg-muted">controls when providers may leave simulation-oriented modes</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">{tile.label}</p>
              <p className="mt-1 text-sm font-bold text-fg tabular-nums">{tile.value}</p>
            </div>
          ))}
        </div>
        <Link
          href="/director/runtime-activation"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Runtime Activation
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
