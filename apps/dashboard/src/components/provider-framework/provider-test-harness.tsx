import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { referenceHarness } from "@/features/provider-framework";

export function ProviderTestHarness() {
  const h = referenceHarness;
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Test Harness</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={h.ok ? "success" : "error"}>{h.ok ? "passing" : "failing"}</Badge>
          <span className="text-xs text-fg-muted tabular-nums">{h.passed}/{h.total}</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {h.steps.map((s) => (
          <div key={s.id} className="flex items-start gap-3 rounded-md border bg-surface-sunken p-3">
            {s.passed ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
            ) : (
              <XCircle className="mt-0.5 size-4 shrink-0 text-error" />
            )}
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium text-fg">{s.label}</span>
              <p className="text-xs text-fg-secondary">{s.detail}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
