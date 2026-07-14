import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { routingReports } from "@/features/provider-routing";
import type { FallbackTier } from "@/features/provider-routing";

const tierVariant: Record<FallbackTier, "success" | "info" | "warning" | "error" | "neutral"> = {
  Primary: "success",
  Secondary: "info",
  Emergency: "warning",
  "Human Escalation": "warning",
  "Simulation Fallback": "neutral",
  "No Provider Available": "error",
};

export function FallbackChain() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fallback Chain</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{routingReports.length} chains</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {routingReports.map((r) => (
          <div key={r.decisionId} className="flex flex-col gap-2 rounded-md border bg-surface-sunken p-3">
            <span className="text-sm font-semibold text-fg">{r.requestId}</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {r.fallbackChain.map((link, i) => (
                <span key={`${link.tier}-${i}`} className="inline-flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="size-3 text-fg-muted" />}
                  <Badge variant={tierVariant[link.tier]}>
                    {link.tier}: {link.name}
                  </Badge>
                </span>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
