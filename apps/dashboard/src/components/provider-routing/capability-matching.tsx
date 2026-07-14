import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { routingDecisions } from "@/features/provider-routing";

export function CapabilityMatching() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Capability Matching</CardTitle>
        <span className="text-xs text-fg-muted">matrix-derived, no provider-specific logic</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {routingDecisions.map((d) => (
          <div key={d.id} className="flex flex-col gap-2 rounded-md border bg-surface-sunken p-3">
            <span className="text-sm font-semibold text-fg">{d.requestId}</span>
            <div className="flex flex-wrap gap-1.5">
              {d.matchedCapabilities.length > 0 ? (
                d.matchedCapabilities.map((c) => (
                  <span key={c} className="rounded-sm bg-primary-subtle px-2 py-0.5 text-xs font-medium text-primary">
                    {c}
                  </span>
                ))
              ) : (
                <span className="text-xs text-fg-muted">No capability matched.</span>
              )}
            </div>
            {d.candidateProviders.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs text-fg-secondary">
                {d.candidateProviders.map((c) => (
                  <span key={c.providerId} className="inline-flex items-center gap-1.5">
                    <Badge variant="neutral">{c.name}</Badge>
                    <span className="tabular-nums">cap {c.capabilityScore}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
