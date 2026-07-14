import Link from "next/link";
import { ArrowRight, BrainCircuit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { codexMetrics } from "@/features/providers/codex";

export function CodexWidget() {
  const tiles = [
    { label: "Status", value: codexMetrics.status },
    { label: "Simulation", value: codexMetrics.simulationMode ? "Enabled" : "Disabled" },
    { label: "Capabilities", value: `${codexMetrics.capabilityCoverage}` },
    { label: "Conformance", value: `${codexMetrics.conformanceScore}` },
    { label: "Credentials", value: codexMetrics.credentialStatus },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="size-4 text-primary" />
          Codex Provider
        </CardTitle>
        <span className="text-xs text-fg-muted">offline provider foundation in simulation mode</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">{tile.label}</p>
              <p className="mt-1 text-sm font-bold text-fg">{tile.value}</p>
            </div>
          ))}
        </div>
        <Link
          href="/director/providers/codex"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Codex Provider
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
