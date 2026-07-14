import Link from "next/link";
import { ArrowRight, BrainCircuit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { claudeLiveMetrics } from "@/features/providers/claude-live";

export function ClaudeLiveWidget() {
  const tiles = [
    { label: "Mode", value: claudeLiveMetrics.mode },
    { label: "Capability", value: claudeLiveMetrics.supportedCapability },
    { label: "Live Eligibility", value: claudeLiveMetrics.liveEligible ? "Eligible" : "Blocked" },
    { label: "Credential", value: claudeLiveMetrics.credentialStatus },
    { label: "Dry Run", value: claudeLiveMetrics.dryRunStatus },
    { label: "Fallback", value: claudeLiveMetrics.simulationFallback ? "Prepared" : "Missing" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="size-4 text-primary" />
          Claude Live
        </CardTitle>
        <span className="text-xs text-fg-muted">gated dry-run-first live integration foundation</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">{tile.label}</p>
              <p className="mt-1 text-sm font-bold text-fg">{tile.value}</p>
            </div>
          ))}
        </div>
        <Link
          href="/director/providers/claude-live"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Claude Live
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
