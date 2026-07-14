import { ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { routingDecisions } from "@/features/provider-routing";
import { PROVIDER_NAMES } from "@/features/provider-matrix";
import type { ProviderId } from "@/features/provider-matrix";

function name(id: ProviderId | null) {
  return id ? PROVIDER_NAMES[id] : "None";
}

export function ProviderSelection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider Selection</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{routingDecisions.length} decisions</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {routingDecisions.map((d) => (
          <div key={d.id} className="flex flex-col gap-2 rounded-md border bg-surface-sunken p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-fg">{d.requestId}</span>
              <div className="flex items-center gap-1.5">
                {d.approvalRequirement.required && (
                  <Badge variant="warning">
                    <ShieldCheck className="size-3" /> Approval
                  </Badge>
                )}
                {d.blocked && <Badge variant="error">blocked</Badge>}
                <Badge variant={d.confidenceBadge}>conf {d.confidence}</Badge>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <Badge variant={d.primaryProvider ? "success" : "error"}>{name(d.primaryProvider)}</Badge>
              {d.fallbackProviders.length > 0 && <ArrowRight className="size-3 text-fg-muted" />}
              {d.fallbackProviders.map((f) => (
                <Badge key={f} variant="info">
                  {PROVIDER_NAMES[f]}
                </Badge>
              ))}
              <span className="ml-auto text-fg-muted tabular-nums">
                ~{d.estimatedLatencyMs}ms · rel {d.estimatedReliability}
              </span>
            </div>
            <p className="text-xs text-fg-secondary">{d.explanation}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
