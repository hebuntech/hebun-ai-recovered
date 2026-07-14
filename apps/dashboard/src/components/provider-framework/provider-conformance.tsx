import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { referenceConformance } from "@/features/provider-framework";

export function ProviderConformance() {
  const c = referenceConformance;
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Conformance Tests</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={c.verdictBadge}>{c.verdict}</Badge>
          <span className="text-xs text-fg-muted tabular-nums">{c.passed}/{c.total} · {c.score}</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {c.checks.map((check) => (
          <div key={check.id} className="flex items-start gap-3 rounded-md border bg-surface-sunken p-3">
            {check.passed ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
            ) : (
              <XCircle className="mt-0.5 size-4 shrink-0 text-error" />
            )}
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium text-fg">{check.label}</span>
              <p className="text-xs text-fg-secondary">{check.detail}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
