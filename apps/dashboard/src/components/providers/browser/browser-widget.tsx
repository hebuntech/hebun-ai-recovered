import Link from "next/link";
import { ArrowRight, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { browserMetrics } from "@/features/providers/browser";

export function BrowserWidget() {
  const tiles = [
    { label: "Status", value: browserMetrics.status },
    { label: "Simulation", value: browserMetrics.simulationMode ? "Enabled" : "Disabled" },
    { label: "Capabilities", value: `${browserMetrics.capabilityCoverage}` },
    { label: "Health", value: browserMetrics.healthStatus },
    { label: "Readiness", value: browserMetrics.simulationReadiness },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="size-4 text-primary" />
          Browser Provider
        </CardTitle>
        <span className="text-xs text-fg-muted">offline browser provider foundation in simulation mode</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
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
          href="/director/providers/browser"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Browser Provider
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
