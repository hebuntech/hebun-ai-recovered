import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { frameworkMetrics as m } from "@/features/provider-framework";

export function ProviderFrameworkWidget() {
  const tiles = [
    { label: "Provider Types", value: `${m.registeredProviderTypes}` },
    { label: "Framework Health", value: `${m.frameworkHealth}%` },
    { label: "Simulation", value: `${m.simulationCoverage}%` },
    { label: "Conformance", value: `${m.conformanceScore}` },
    { label: "Version", value: `v${m.frameworkVersion}` },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="size-4 text-primary" />
          Provider Adapter Framework
        </CardTitle>
        <span className="text-xs text-fg-muted">standardizes future provider adapters</span>
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
          href="/director/provider-framework"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Provider Framework
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
