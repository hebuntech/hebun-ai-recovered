import Link from "next/link";
import { ArrowRight, Boxes } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adapterMetrics as m } from "@/features/adapters";

export function AdapterWidget() {
  const tiles = [
    { label: "Registered", value: `${m.registered}` },
    { label: "Healthy", value: `${m.healthy}` },
    { label: "Simulation", value: m.simulationReady ? "Ready" : "Down" },
    { label: "Capabilities", value: `${m.capabilitiesCovered}/${m.capabilitiesTotal}` },
    { label: "Success Rate", value: `${m.successRate}%` },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Boxes className="size-4 text-primary" />
          Execution Adapter SDK
        </CardTitle>
        <span className="text-xs text-fg-muted">provider-independent adapter layer</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">{t.label}</p>
              <p className="mt-1 text-sm font-bold text-fg">{t.value}</p>
            </div>
          ))}
        </div>
        <Link
          href="/director/adapters"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Adapter SDK
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
