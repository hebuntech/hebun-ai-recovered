import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { PatternCard } from "@/components/intelligence/pattern-card";
import { patterns } from "@/features/intelligence/mock";

export default function PatternsPage() {
  const actioned = patterns.filter((p) => p.status === "actioned").length;
  const confirmed = patterns.filter((p) => p.status === "confirmed").length;
  const monitoring = patterns.filter((p) => p.status === "monitoring").length;

  return (
    <>
      <PageHeader
        title="Pattern Discovery"
        context="Patterns extracted from experience across the organization."
        action={<Badge variant="primary">{patterns.length} patterns</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-6 sm:col-span-3"><StatCard label="Discovered" value={`${patterns.length}`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Actioned" value={`${actioned}`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Confirmed" value={`${confirmed}`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Monitoring" value={`${monitoring}`} /></div>

        {patterns.map((p) => (
          <div key={p.id} className="col-span-12 sm:col-span-6 xl:col-span-4">
            <PatternCard pattern={p} />
          </div>
        ))}
      </div>
    </>
  );
}
