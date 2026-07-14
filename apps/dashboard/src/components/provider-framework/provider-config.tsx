import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { providerConfigSchema, CREDENTIALS_PLACEHOLDER } from "@/features/provider-framework";

export function ProviderConfigSchema() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Configuration Schema</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{providerConfigSchema.length} fields</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {providerConfigSchema.map((f) => (
          <div key={f.key} className="flex items-start justify-between gap-3 rounded-md border bg-surface-sunken p-2.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-fg">{f.key}</span>
                {f.type === "secret" && <Badge variant="warning">placeholder</Badge>}
              </div>
              <p className="text-xs text-fg-muted">{f.description}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-xs">
              <span className="text-fg-secondary">{f.type}</span>
              {f.required && <Badge variant="info">required</Badge>}
            </div>
          </div>
        ))}
        <p className="text-xs text-fg-muted">
          Credentials are never stored or implemented — schema shows{" "}
          <span className="font-mono">{CREDENTIALS_PLACEHOLDER}</span> only.
        </p>
      </CardContent>
    </Card>
  );
}
