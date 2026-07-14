import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { capabilityCatalog, capabilityCoverage } from "@/features/adapters";

export function AdapterCapabilities() {
  const coverage = capabilityCoverage();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Capabilities</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{capabilityCatalog.length} in catalog</span>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {capabilityCatalog.map((cap) => {
          const covered = (coverage[cap.kind] ?? []).length > 0;
          return (
            <div key={cap.id} className="flex flex-col gap-1.5 rounded-md border bg-surface-sunken p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-fg">{cap.label}</span>
                <span className={cn("size-2 rounded-full", covered ? "bg-success" : "bg-fg-muted")} />
              </div>
              <p className="text-xs text-fg-secondary">{cap.description}</p>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant={cap.deterministic ? "success" : "warning"}>
                  {cap.deterministic ? "deterministic" : "non-deterministic"}
                </Badge>
                <span className="text-fg-muted">{covered ? `${coverage[cap.kind].length} adapter` : "no adapter yet"}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
