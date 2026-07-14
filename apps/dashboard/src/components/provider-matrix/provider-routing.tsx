import { ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { routingRules, PROVIDER_NAMES } from "@/features/provider-matrix";

export function ProviderRouting() {
  const routable = routingRules.filter((r) => r.primary);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Routing Intelligence</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{routable.length} routes</span>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {routable.map((rule) => (
          <div
            key={rule.capability}
            className="flex flex-col gap-1.5 rounded-md border bg-surface-sunken p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-fg">{rule.capability}</span>
              {rule.requiresHumanApproval && (
                <Badge variant="warning">
                  <ShieldCheck className="size-3" /> Approval
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <Badge variant="success">{PROVIDER_NAMES[rule.primary!]}</Badge>
              {rule.secondary.length > 0 && <ArrowRight className="size-3 text-fg-muted" />}
              {rule.secondary.map((s) => (
                <Badge key={s} variant="info">
                  {PROVIDER_NAMES[s]}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
