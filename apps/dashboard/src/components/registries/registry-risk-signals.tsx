import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RegistryRiskSignal } from "@/features/registries/risk-signals";

function severityVariant(severity: RegistryRiskSignal["severity"]) {
  if (severity === "error") return "error";
  if (severity === "warning") return "warning";
  if (severity === "success") return "success";
  return "info";
}

export function RegistryRiskSignals({
  signals,
  title = "Risk Signals",
}: {
  signals: RegistryRiskSignal[];
  title?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <span className="text-xs text-fg-muted">
          signals inferred from registry health and relationships
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {signals.map((signal) => (
          <div
            key={signal.id}
            className="rounded-md border bg-surface-sunken p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-fg">{signal.title}</p>
                <p className="mt-1 text-sm text-fg-secondary">
                  {signal.detail}
                </p>
              </div>
              <Badge variant={severityVariant(signal.severity)}>
                {signal.severity}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-fg-muted">
              <span>{signal.owner}</span>
              <span>·</span>
              <span>{signal.trigger}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
