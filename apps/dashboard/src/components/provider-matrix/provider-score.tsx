import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { providerScores } from "@/features/provider-matrix";

const dimensions: { key: keyof (typeof providerScores)[number]; label: string }[] = [
  { key: "coverage", label: "Coverage" },
  { key: "capabilityBreadth", label: "Breadth" },
  { key: "simulationReadiness", label: "Simulation" },
  { key: "routingPriority", label: "Priority" },
  { key: "integrationReadiness", label: "Integration" },
  { key: "health", label: "Health" },
];

export function ProviderScore() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider Scores</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{providerScores.length} providers ranked</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {providerScores.map((s) => (
          <div key={s.providerId} className="flex flex-col gap-2 rounded-md border bg-surface-sunken p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-fg">{s.name}</span>
              <Badge variant={s.badge}>{s.total}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {dimensions.map((d) => (
                <div key={d.label} className="flex flex-col">
                  <span className="text-[0.65rem] uppercase tracking-wider text-fg-muted">{d.label}</span>
                  <span className="text-sm font-medium text-fg tabular-nums">{s[d.key] as number}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
