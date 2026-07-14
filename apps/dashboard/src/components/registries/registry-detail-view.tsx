import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import {
  registryById,
  registryGrowthHistory,
  registryRecords,
} from "@/features/registries";
import type { RegistryKey } from "@/features/registries/types";
import { RegistryMetrics } from "@/components/registries/registry-metrics";
import { RegistryHealthCard } from "@/components/registries/registry-health-card";
import { RegistryGrowthChart } from "@/components/registries/registry-growth-chart";
import { RegistryIntelligencePanel } from "@/components/registries/registry-intelligence-panel";
import { RegistryTable } from "@/components/registries/registry-table";
import { RegistryTimeline } from "@/components/registries/registry-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RegistryDetailView({ registryId }: { registryId: RegistryKey }) {
  const registry = registryById(registryId);
  if (!registry) return null;

  return (
    <>
      <PageHeader
        title={registry.title}
        context={registry.description}
        action={<Badge variant="success">Health {registry.health}</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        <RegistryMetrics registry={registry} />

        <div className="col-span-12 xl:col-span-7">
          <RegistryHealthCard registry={registry} />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <RegistryGrowthChart
            title="Registry Growth"
            points={registryGrowthHistory[registryId]}
          />
        </div>

        <div className="col-span-12 xl:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Registry Context</CardTitle>
              <span className="text-xs text-fg-muted">{registry.owner}</span>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                  Consumers
                </p>
                <p className="mt-1 text-sm text-fg-secondary">
                  {registry.consumers.join(", ")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                  Dependencies
                </p>
                <p className="mt-1 text-sm text-fg-secondary">
                  {registry.dependencies.join(", ")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                  Freshness
                </p>
                <p className="mt-1 text-sm text-fg-secondary">{registry.freshness}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 xl:col-span-8">
          <RegistryTable
            title="Mock Searchable Table"
            records={registryRecords[registryId]}
          />
        </div>

        <div className="col-span-12">
          <RegistryIntelligencePanel registryId={registryId} />
        </div>

        <div className="col-span-12">
          <RegistryTimeline
            registryId={registryId}
            title="Recent Activity"
          />
        </div>
      </div>
    </>
  );
}
