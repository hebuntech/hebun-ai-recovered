import { Boxes, Database, Activity } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EngineCard } from "@/components/architecture/engine-card";
import { FlowChain, type FlowChainItem } from "@/components/architecture/flow-chain";
import {
  enginesByCore,
  registries,
  type CoreDefinition,
} from "@/features/architecture/mock";

interface CoreDetailProps {
  core: CoreDefinition;
  flow: FlowChainItem[];
  flowTitle: string;
  registryIds: string[];
}

export function CoreDetail({ core, flow, flowTitle, registryIds }: CoreDetailProps) {
  const coreEngines = enginesByCore(core.id);
  const coreRegistries = registries.filter((r) => registryIds.includes(r.id));

  return (
    <>
      <PageHeader
        title={core.name}
        context={core.tagline}
        action={<Badge variant="success">{core.adr} · {core.health}% health</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 sm:col-span-4">
          <StatCard label="Engines" value={`${coreEngines.length}`} caption="in this core" icon={<Boxes className="size-4" />} />
        </div>
        <div className="col-span-12 sm:col-span-4">
          <StatCard label="Registries" value={`${coreRegistries.length}`} caption="state / definition" icon={<Database className="size-4" />} />
        </div>
        <div className="col-span-12 sm:col-span-4">
          <StatCard label="Health" value={`${core.health}%`} caption={core.status} icon={<Activity className="size-4" />} />
        </div>

        {/* Engines */}
        {coreEngines.map((engine) => (
          <div key={engine.id} className="col-span-12 sm:col-span-6 xl:col-span-4">
            <EngineCard engine={engine} />
          </div>
        ))}

        {/* Flow + registries */}
        <div className="col-span-12 xl:col-span-7">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{flowTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <FlowChain items={flow} />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 xl:col-span-5">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Registries</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {coreRegistries.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-md border bg-surface-sunken p-3">
                  <div>
                    <p className="text-sm font-medium text-fg">{r.name}</p>
                    <p className="text-xs text-fg-muted">{r.owner}</p>
                  </div>
                  <span className="tabular-nums text-sm font-semibold text-fg-secondary">
                    {r.records.toLocaleString()}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
