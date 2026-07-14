import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { networkHealth, providerCatalog, PROVIDER_NAMES } from "@/features/provider-matrix";

function healthVariant(status: string) {
  return status === "Healthy" ? "success" : status === "Degraded" ? "warning" : "error";
}

export function ProviderHealth() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider Network Health</CardTitle>
        <Badge variant={networkHealth.badge}>{networkHealth.overallHealth}%</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Overall", value: `${networkHealth.overallHealth}%` },
            { label: "Simulation", value: `${networkHealth.simulationCoverage}%` },
            { label: "Capabilities", value: `${networkHealth.capabilityCoverage}%` },
            { label: "Missing", value: `${networkHealth.missingProviders}` },
          ].map((t) => (
            <div key={t.label} className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">{t.label}</p>
              <p className="mt-1 text-sm font-bold text-fg tabular-nums">{t.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          {providerCatalog.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-2 rounded-md border bg-surface-sunken p-2.5"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-fg">{PROVIDER_NAMES[p.id]}</span>
                <span className="text-xs text-fg-muted">{p.health.note}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-fg-secondary">
                <span className="tabular-nums">{p.health.availability}%</span>
                <Badge variant={healthVariant(p.health.status)}>{p.health.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
