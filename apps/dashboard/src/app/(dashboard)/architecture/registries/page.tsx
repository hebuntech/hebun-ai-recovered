import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { RegistryTable } from "@/components/architecture/registry-table";
import { registries, registryTypeLabel, type RegistryType } from "@/features/architecture/mock";
import { Database, Boxes, Brain, ShieldCheck } from "lucide-react";

const typeIcon = {
  definition: <Boxes className="size-4" />,
  state: <Database className="size-4" />,
  learning: <Brain className="size-4" />,
  governance: <ShieldCheck className="size-4" />,
} as const;

export default function RegistriesPage() {
  const byType = (t: RegistryType) => registries.filter((r) => r.type === t).length;
  const types: RegistryType[] = ["definition", "state", "learning", "governance"];

  return (
    <>
      <PageHeader
        title="Registries"
        context="Every registry in the platform — the single source of truth layer."
        action={<Badge variant="primary">{registries.length} registries</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        {types.map((t) => (
          <div key={t} className="col-span-12 sm:col-span-6 xl:col-span-3">
            <StatCard
              label={registryTypeLabel[t]}
              value={`${byType(t)}`}
              caption="registries"
              icon={typeIcon[t]}
            />
          </div>
        ))}

        <div className="col-span-12">
          <RegistryTable registries={registries} />
        </div>
      </div>
    </>
  );
}
