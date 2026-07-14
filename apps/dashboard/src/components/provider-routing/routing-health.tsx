import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { routingDecisions } from "@/features/provider-routing";

function healthVariant(status: string) {
  return status === "Healthy" ? "success" : status === "Degraded" ? "warning" : "error";
}

export function RoutingHealth() {
  // Health assessments are identical per provider across decisions; take the
  // richest decision (most candidates) as the representative sample.
  const sample = [...routingDecisions].sort(
    (a, b) => b.healthAssessment.length - a.healthAssessment.length
  )[0];
  const assessments = sample?.healthAssessment ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Evaluation</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{assessments.length} providers</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {assessments.map((a) => (
          <div
            key={a.providerId}
            className="flex items-center justify-between gap-2 rounded-md border bg-surface-sunken p-2.5"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-fg">{a.providerId}</span>
              <span className="text-xs text-fg-muted">
                availability {a.availability}% · reliability {a.reliability} · {a.simulationReady ? "sim ✓" : "sim ✗"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-fg-secondary">
              <span className="tabular-nums">{a.latencyMs}ms</span>
              <Badge variant={healthVariant(a.status)}>{a.status}</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
