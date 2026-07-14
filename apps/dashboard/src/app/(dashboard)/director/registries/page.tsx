import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import {
  registryDefinitions,
  registryOverviewMetrics,
} from "@/features/registries";
import { RegistrySummary } from "@/components/registries/registry-summary";
import { RegistryManager } from "@/components/registries/registry-manager";
import { RegistryCard } from "@/components/registries/registry-card";
import { RegistryHealthCard } from "@/components/registries/registry-health-card";
import { RegistryGrowthChart } from "@/components/registries/registry-growth-chart";
import { RegistryRelationshipGraph } from "@/components/registries/registry-relationship-graph";
import { RegistryIntelligencePanel } from "@/components/registries/registry-intelligence-panel";
import { RegistryTimeline } from "@/components/registries/registry-timeline";
import { registryGrowthHistory } from "@/features/registries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegistryOverviewPage() {
  const topGrowth = registryDefinitions
    .slice()
    .sort((a, b) => b.dailyGrowth - a.dailyGrowth)
    .slice(0, 4);

  const attentionRegistries = registryDefinitions.filter(
    (registry) => registry.status !== "healthy"
  );

  return (
    <>
      <PageHeader
        title="Registry Center"
        context="The enterprise registry console for master data, operations and platform objects."
        action={
          <Badge variant="success">
            Registry Health {registryOverviewMetrics.registryHealth}
          </Badge>
        }
      />

      <div className="grid grid-cols-12 gap-6">
        <RegistrySummary />

        <div className="col-span-12">
          <RegistryManager />
        </div>

        <div className="col-span-12 xl:col-span-8">
          <RegistryRelationshipGraph />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Registry Activity</CardTitle>
              <span className="text-xs text-fg-muted">
                where records are changing fastest
              </span>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {topGrowth.map((registry) => (
                <div
                  key={registry.id}
                  className="rounded-md border bg-surface-sunken p-3"
                >
                  <p className="text-sm font-semibold text-fg">{registry.title}</p>
                  <p className="text-sm text-fg-secondary">
                    +{registry.dailyGrowth}/day · {registry.totalRecords} total
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RegistryGrowthChart
            title="Registry Growth"
            points={registryGrowthHistory.executions}
          />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Registry Health</CardTitle>
              <span className="text-xs text-fg-muted">
                registries requiring attention
              </span>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {attentionRegistries.map((registry) => (
                <div key={registry.id}>
                  <RegistryHealthCard registry={registry} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12">
          <RegistryIntelligencePanel />
        </div>

        {registryDefinitions
          .filter((registry) => registry.route)
          .map((registry) => (
            <div key={registry.id} className="col-span-12 sm:col-span-6 xl:col-span-4">
              <RegistryCard registry={registry} />
            </div>
          ))}

        <div className="col-span-12">
          <RegistryTimeline title="Registry Timeline" />
        </div>
      </div>
    </>
  );
}
