import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { capabilityGaps, futureProviders } from "@/features/provider-matrix";
import type { GapStatus } from "@/features/provider-matrix";

const statusVariant: Record<GapStatus, "success" | "warning" | "error"> = {
  covered: "success",
  partial: "warning",
  missing: "error",
};

export function ProviderGaps() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gap Analysis</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">
          {futureProviders.length} future providers required
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-secondary">
            In-matrix coverage
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {capabilityGaps.map((g) => (
              <div
                key={g.capability}
                className="flex items-center justify-between gap-2 rounded-md border bg-surface-sunken p-2.5"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-fg">{g.capability}</span>
                  <span className="text-xs text-fg-muted">{g.note}</span>
                </div>
                <Badge variant={statusVariant[g.status]}>{g.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-secondary">
            Missing domains — future provider required
          </p>
          <div className="flex flex-wrap gap-1.5">
            {futureProviders.map((f) => (
              <span
                key={f.domain}
                className="rounded-sm bg-warning-subtle px-2 py-0.5 text-xs font-medium text-warning"
                title={f.note}
              >
                {f.domain}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
