import { KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { runtimeDecisions } from "@/features/runtime-boundary";
import type { CredentialState } from "@/features/runtime-boundary";

const stateVariant: Record<CredentialState, "success" | "info" | "warning" | "error" | "neutral"> = {
  "Not Required": "success",
  Placeholder: "info",
  Injected: "success",
  Missing: "warning",
  Invalid: "error",
  Expired: "error",
};

export function RuntimeCredentials() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="size-4 text-primary" />
          Credential Status
        </CardTitle>
        <span className="text-xs text-fg-muted">placeholders only — nothing loaded</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {runtimeDecisions.map((d) => (
          <div
            key={d.id}
            className="flex items-center justify-between gap-2 rounded-md border bg-surface-sunken p-2.5"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-fg">{d.requestId}</span>
              <span className="text-xs text-fg-muted">{d.credential.note}</span>
            </div>
            <Badge variant={stateVariant[d.credential.state]}>{d.credential.state}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
