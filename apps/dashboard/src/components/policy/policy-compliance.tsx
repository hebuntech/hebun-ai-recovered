import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GovernanceResult } from "@/features/policy";

export function PolicyCompliance({ result }: { result: GovernanceResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Evaluation</CardTitle>
        <span className="text-xs text-fg-muted">
          deterministic compliance checks across required frameworks
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {result.complianceResults.map((item) => (
          <div key={item.framework} className="rounded-md border bg-surface-sunken p-4">
            <p className="text-sm font-semibold text-fg">{item.framework}</p>
            <p className="mt-1 text-sm text-fg-secondary">{item.detail}</p>
            <p className="mt-2 text-xs text-fg-muted">
              {item.status} · score {item.score}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
