import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { runtimeDecisions } from "@/features/runtime-boundary";

export function RuntimeReadiness() {
  // Readiness checks are provider-scoped; show one representative per provider.
  const seen = new Set<string>();
  const rows = runtimeDecisions.filter((d) => {
    const key = d.providerId ?? "none";
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider & Runtime Readiness</CardTitle>
        <span className="text-xs text-fg-muted">7 checks per provider</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {rows.map((d) => (
          <div key={d.id} className="flex flex-col gap-2 rounded-md border bg-surface-sunken p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-fg">{d.providerId ?? "no provider"}</span>
              <Badge variant={d.readiness.ready ? "success" : "warning"}>{d.readiness.score}%</Badge>
            </div>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {d.readiness.checks.map((c) => (
                <div key={c.label} className="flex items-center gap-1.5 text-xs" title={c.note}>
                  {c.ready ? (
                    <Check className="size-3 shrink-0 text-success" />
                  ) : (
                    <X className="size-3 shrink-0 text-fg-muted" />
                  )}
                  <span className={c.ready ? "text-fg-secondary" : "text-fg-muted"}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
