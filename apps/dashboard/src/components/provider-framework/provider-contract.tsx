import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { referenceProvider, frameworkVersion } from "@/features/provider-framework";

const contractMembers = [
  "metadata", "version", "providerType", "supportedCapabilities",
  "supportedExecutionModes", "configurationSchema", "simulationSupport",
  "health()", "validate()", "normalizeRequest()", "normalizeResponse()", "normalizeError()",
];

export function ProviderContract() {
  const p = referenceProvider;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider Contract</CardTitle>
        <Badge variant="info">framework v{frameworkVersion}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-1.5">
          {contractMembers.map((m) => (
            <span key={m} className="rounded-sm border bg-surface-sunken px-2 py-0.5 font-mono text-xs text-fg-secondary">
              {m}
            </span>
          ))}
        </div>
        <div className="rounded-md border bg-surface-sunken p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-fg">{p.metadata.name}</span>
            <Badge variant="info">reference</Badge>
            <Badge variant="success">{p.providerType}</Badge>
          </div>
          <p className="mt-1 text-xs text-fg-secondary">{p.metadata.description}</p>
          <p className="mt-2 text-xs text-fg-muted">
            Real providers implement this same contract. Only the deterministic reference provider exists today.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
