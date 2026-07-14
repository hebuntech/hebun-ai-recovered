import Link from "next/link";
import { ArrowRight, Cpu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computerUseMetrics } from "@/features/providers/computer-use";

export function ComputerUseWidget() {
  const tiles = [
    { label: "Status", value: computerUseMetrics.status },
    { label: "Simulation", value: computerUseMetrics.simulationMode ? "Enabled" : "Disabled" },
    { label: "Capabilities", value: `${computerUseMetrics.capabilityCoverage}` },
    { label: "Health", value: computerUseMetrics.healthStatus },
    { label: "Safety", value: computerUseMetrics.safetyStatus },
    { label: "Readiness", value: computerUseMetrics.simulationReadiness },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="size-4 text-primary" />
          Computer Use Provider
        </CardTitle>
        <span className="text-xs text-fg-muted">offline desktop provider foundation in simulation mode</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
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
          href="/director/providers/computer-use"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Computer Use Provider
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
