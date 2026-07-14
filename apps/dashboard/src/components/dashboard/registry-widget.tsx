import Link from "next/link";
import { ArrowRight, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { registryOverviewMetrics } from "@/features/registries";

export function RegistryWidget() {
  const tiles = [
    { label: "Registries", value: `${registryOverviewMetrics.totalRegistries}` },
    { label: "Health", value: `${registryOverviewMetrics.registryHealth}` },
    { label: "Total Records", value: `${registryOverviewMetrics.totalRecords}` },
    { label: "Recent Changes", value: `${registryOverviewMetrics.recentChanges}` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="size-4 text-primary" />
          Registries
        </CardTitle>
        <span className="text-xs text-fg-muted">master data and operational registry layer</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                {tile.label}
              </p>
              <p className="mt-1 text-lg font-bold tabular-nums">{tile.value}</p>
            </div>
          ))}
        </div>
        <Link
          href="/director/registries"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Registry Center
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
