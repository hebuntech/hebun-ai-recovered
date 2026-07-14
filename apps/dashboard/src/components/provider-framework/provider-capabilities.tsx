import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { providerTypeDefinitions } from "@/features/provider-framework";

export function ProviderCapabilities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Supported Provider Types & Capability Mapping</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{providerTypeDefinitions.length} types</span>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {providerTypeDefinitions.map((def) => (
          <div key={def.id} className="flex flex-col gap-2 rounded-md border bg-surface-sunken p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-fg">{def.label}</span>
              <Badge variant="neutral">{def.status}</Badge>
            </div>
            <p className="text-xs text-fg-secondary">{def.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {def.defaultCapabilities.map((c) => (
                <span key={c} className="rounded-sm bg-primary-subtle px-2 py-0.5 text-xs font-medium text-primary">
                  {c}
                </span>
              ))}
            </div>
            <span className="text-xs text-fg-muted">modes: {def.executionModes.join(" · ")}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
