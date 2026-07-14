import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { invocations } from "@/features/provider-invocation";
import type { ExpectedResponseStatus } from "@/features/provider-invocation";

const statusVariant: Record<ExpectedResponseStatus, "success" | "info" | "error"> = {
  simulated: "success",
  planned: "info",
  blocked: "error",
};

export function InvocationResponseView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expected Response</CardTitle>
        <span className="text-xs text-fg-muted">contract shape, deterministic</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {invocations.map((inv) => (
          <div key={inv.id} className="flex flex-col gap-2 rounded-md border bg-surface-sunken p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-fg">{inv.requestId}</span>
              <Badge variant={statusVariant[inv.expectedResponse.status]}>{inv.expectedResponse.status}</Badge>
            </div>
            <p className="text-xs text-fg-secondary">{inv.expectedResponse.summary}</p>
            <div className="flex flex-wrap gap-1.5">
              {inv.expectedResponse.artifactKinds.map((k) => (
                <span key={k} className="rounded-sm bg-info-subtle px-2 py-0.5 text-xs font-medium text-info">
                  {k}
                </span>
              ))}
            </div>
            <span className="text-xs text-fg-muted">finish: {inv.expectedResponse.finishReason}</span>
            {inv.expectedResponse.warnings.map((w) => (
              <span key={w} className="text-xs text-warning">
                ⚠ {w}
              </span>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
