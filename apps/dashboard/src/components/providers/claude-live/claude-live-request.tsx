import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { claudeLiveRecord } from "@/features/providers/claude-live";

export function ClaudeLiveRequestPreview() {
  const request = claudeLiveRecord.request;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Preview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm text-fg-secondary">
        <div className="rounded-md border bg-surface-sunken p-4">
          <p className="font-semibold text-fg">{request.id}</p>
          <p className="mt-1">Mode: {request.mode}</p>
          <p className="mt-1">Capability: {request.capability}</p>
          <p className="mt-1">Activation Decision: {request.activationDecisionId ?? "not linked"}</p>
          <p className="mt-1">Runtime Decision: {request.runtimeDecisionId ?? "not linked"}</p>
          <p className="mt-1">Invocation: {request.invocationId ?? "not linked"}</p>
        </div>
        <div className="rounded-md border bg-surface-sunken p-4">
          <p className="text-xs uppercase tracking-wider text-fg-secondary">Input</p>
          <p className="mt-2 text-fg">{request.input}</p>
        </div>
        <div className="rounded-md border bg-surface-sunken p-4">
          <p className="text-xs uppercase tracking-wider text-fg-secondary">Constraints</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {request.constraints.map((constraint) => (
              <span key={constraint} className="rounded-full border px-2 py-1 text-xs text-fg-secondary">
                {constraint}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
