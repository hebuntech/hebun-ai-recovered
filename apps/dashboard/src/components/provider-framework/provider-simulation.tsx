import { FlaskConical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { simulationProfiles } from "@/features/provider-framework";

export function ProviderSimulation() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="size-4 text-primary" />
          Simulation Profiles
        </CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{simulationProfiles.length}</span>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {simulationProfiles.map((p) => (
          <div key={p.providerType} className="rounded-md border bg-surface-sunken p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-fg">{p.providerType}</span>
              <Badge variant={p.deterministic ? "success" : "warning"}>
                {p.deterministic ? "deterministic" : "non-deterministic"}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-fg-secondary">{p.sampleResponse.resultSummary}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-fg-muted">
              <span>req: {p.sampleRequest.executionMode}</span>
              <span>· res: {p.sampleResponse.status}</span>
              <span>· fail: {p.sampleFailure.code}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
