import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReasoningResult } from "@/features/reasoning";

function riskVariant(risk: ReasoningResult["riskLevel"]) {
  if (risk === "critical") return "error";
  if (risk === "high") return "warning";
  if (risk === "medium") return "info";
  return "success";
}

export function ReasoningConfidence({ result }: { result: ReasoningResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Confidence Score</CardTitle>
        <Badge variant={riskVariant(result.riskLevel)}>{result.riskLevel}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="text-lg font-semibold text-fg">{result.confidenceScore}</p>
          <p className="mt-1 text-sm text-fg-secondary">
            Confidence is derived from evidence strength, constraint outcomes, goal alignment, and trade-off margin.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {result.constraints.map((constraint) => (
            <div key={constraint.id} className="rounded-md border bg-surface-sunken p-3 text-sm text-fg-secondary">
              {constraint.label}: {constraint.status}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
