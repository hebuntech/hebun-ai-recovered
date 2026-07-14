import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { invocations } from "@/features/provider-invocation";

export function InvocationArtifacts() {
  const prepared = invocations.filter((i) => i.artifacts.length > 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Artifact Contracts</CardTitle>
        <span className="text-xs text-fg-muted">contracts only, no real files</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {prepared.map((inv) => (
          <div key={inv.id} className="flex flex-col gap-2 rounded-md border bg-surface-sunken p-3">
            <span className="text-sm font-semibold text-fg">{inv.requestId}</span>
            <div className="flex flex-col gap-1">
              {inv.artifacts.map((a) => (
                <div key={a.kind} className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-fg">{a.label}</span>
                  <span className="text-fg-muted">{a.description}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
