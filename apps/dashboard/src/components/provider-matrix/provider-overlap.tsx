import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { significantOverlaps, PROVIDER_NAMES } from "@/features/provider-matrix";

function overlapVariant(score: number) {
  return score >= 40 ? "warning" : score >= 20 ? "info" : "neutral";
}

export function ProviderOverlap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overlap Analysis</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{significantOverlaps.length} pairs</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {significantOverlaps.map((o) => (
          <div
            key={`${o.a}-${o.b}`}
            className="flex flex-col gap-1.5 rounded-md border bg-surface-sunken p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-fg">
                {PROVIDER_NAMES[o.a]} ↔ {PROVIDER_NAMES[o.b]}
              </span>
              <Badge variant={overlapVariant(o.overlapScore)}>{o.overlapScore}%</Badge>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {o.sharedCapabilities.map((c) => (
                <span
                  key={c}
                  className="rounded-sm bg-primary-subtle px-2 py-0.5 text-xs font-medium text-primary"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
