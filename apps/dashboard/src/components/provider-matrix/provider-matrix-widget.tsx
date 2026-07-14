import Link from "next/link";
import { ArrowRight, Grid3x3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { providerMatrixMetrics as m } from "@/features/provider-matrix";

export function ProviderMatrixWidget() {
  const tiles = [
    { label: "Providers", value: `${m.providerCount}` },
    { label: "Coverage", value: `${m.coveredCapabilities}/${m.totalCapabilities}` },
    { label: "Health", value: `${m.overallHealth}%` },
    { label: "Missing", value: `${m.missingProviders}` },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3x3 className="size-4 text-primary" />
          Provider Capability Matrix
        </CardTitle>
        <span className="text-xs text-fg-muted">single source of truth for provider routing</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">{t.label}</p>
              <p className="mt-1 text-sm font-bold text-fg tabular-nums">{t.value}</p>
            </div>
          ))}
        </div>
        <Link
          href="/director/provider-matrix"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Provider Matrix
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
