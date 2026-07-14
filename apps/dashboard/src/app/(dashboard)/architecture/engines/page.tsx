import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { EngineCard } from "@/components/architecture/engine-card";
import { coreTheme } from "@/components/architecture/core-theme";
import { cn } from "@/lib/utils";
import { cores, engines, enginesByCore } from "@/features/architecture/mock";

export default function EnginesPage() {
  return (
    <>
      <PageHeader
        title="Engines"
        context="All engines across the four cores of the AI Operating System."
        action={<Badge variant="primary">{engines.length} engines</Badge>}
      />

      <div className="flex flex-col gap-8">
        {cores.map((core) => {
          const theme = coreTheme[core.id];
          const coreEngines = enginesByCore(core.id);
          return (
            <section key={core.id}>
              <div className="mb-4 flex items-center gap-2">
                <span className={cn("size-2.5 rounded-full", theme.dot)} />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-fg">
                  {core.name}
                </h3>
                <span className="text-xs text-fg-muted tabular-nums">
                  {coreEngines.length} engines
                </span>
              </div>
              <div className="grid grid-cols-12 gap-6">
                {coreEngines.map((engine) => (
                  <div key={engine.id} className="col-span-12 sm:col-span-6 xl:col-span-4">
                    <EngineCard engine={engine} />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
