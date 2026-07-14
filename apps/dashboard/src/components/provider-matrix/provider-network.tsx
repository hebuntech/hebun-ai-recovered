import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { providerCatalog, executionModes, PROVIDER_NAMES } from "@/features/provider-matrix";

export function ProviderNetwork() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Provider Network Overview</CardTitle>
          <span className="text-xs text-fg-muted tabular-nums">{providerCatalog.length} providers</span>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {providerCatalog.map((p) => (
            <div key={p.id} className="flex flex-col gap-2 rounded-md border bg-surface-sunken p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-fg">{PROVIDER_NAMES[p.id]}</span>
                <Badge variant="neutral">{p.priority}</Badge>
              </div>
              <span className="text-xs text-fg-muted">
                {p.family} · {p.providerType}
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <Badge variant="info">{p.executionMode}</Badge>
                <span className="text-fg-secondary tabular-nums">
                  {p.primaryCapabilities.length}P · {p.secondaryCapabilities.length}S
                </span>
                <span className="text-fg-muted tabular-nums">conf {p.conformanceScore}</span>
              </div>
              <span className="text-xs text-fg-muted">
                {p.simulationSupport ? "Simulation ✓" : "Simulation ✗"} · Live{" "}
                {p.liveSupport ? "✓" : "future"} · {p.credentialStatus}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Execution Modes</CardTitle>
          <span className="text-xs text-fg-muted tabular-nums">{executionModes.length} modes</span>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {executionModes.map((mode) => (
            <div key={mode.mode} className="flex flex-col gap-1.5 rounded-md border bg-surface-sunken p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-fg">{mode.label}</span>
                <Badge variant={mode.active ? "success" : "neutral"}>
                  {mode.active ? "active" : "future"}
                </Badge>
              </div>
              <p className="text-xs text-fg-secondary">{mode.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {mode.providers.map((id) => (
                  <span
                    key={id}
                    className="rounded-sm bg-primary-subtle px-2 py-0.5 text-xs font-medium text-primary"
                  >
                    {PROVIDER_NAMES[id]}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
