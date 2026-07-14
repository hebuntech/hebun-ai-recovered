import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { simulationProfileFor, providerErrorMappings } from "@/features/provider-framework";

export function ProviderNormalization() {
  const profile = simulationProfileFor("Automation Provider");
  const req = profile.sampleRequest;
  const res = profile.sampleResponse;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request · Response · Error Normalization</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-md border bg-surface-sunken p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-muted">Normalized Request</p>
          <ul className="flex flex-col gap-1 text-xs text-fg-secondary">
            <li>requestId · <span className="font-mono">{req.requestId}</span></li>
            <li>providerType · {req.providerType}</li>
            <li>executionMode · {req.executionMode}</li>
            <li>capabilities · {req.capabilities.join(", ") || "—"}</li>
            <li>constraints · {req.constraints.join(", ")}</li>
          </ul>
        </div>
        <div className="rounded-md border bg-surface-sunken p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-muted">Normalized Response</p>
          <ul className="flex flex-col gap-1 text-xs text-fg-secondary">
            <li>status · <Badge variant="info">{res.status}</Badge></li>
            <li>result · {res.resultSummary}</li>
            <li>steps · {res.metrics.steps} · {res.metrics.durationMs}ms</li>
            <li>artifacts · {res.artifacts.length}</li>
            <li>warnings · {res.warnings.length} · errors · {res.errors.length}</li>
          </ul>
        </div>
        <div className="rounded-md border bg-surface-sunken p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-muted">Error Normalization</p>
          <ul className="flex flex-col gap-1 text-xs text-fg-secondary">
            {providerErrorMappings.map((m) => (
              <li key={m.category} className="flex items-center justify-between gap-2">
                <span>{m.category}</span>
                <span className="font-mono text-fg-muted">→ {m.sdkCode}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
