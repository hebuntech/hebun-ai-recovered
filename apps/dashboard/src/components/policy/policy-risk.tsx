import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GovernanceResult } from "@/features/policy";

function riskVariant(level: GovernanceResult["riskAssessment"]["level"]) {
  if (level === "critical") return "error";
  if (level === "high") return "warning";
  if (level === "medium") return "info";
  return "success";
}

export function PolicyRisk({ result }: { result: GovernanceResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Assessment</CardTitle>
        <Badge variant={riskVariant(result.riskAssessment.level)}>
          {result.riskAssessment.level}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-fg-secondary">{result.riskAssessment.detail}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {result.riskAssessment.drivers.map((driver) => (
            <div key={driver} className="rounded-md border bg-surface-sunken p-3 text-sm text-fg-secondary">
              {driver}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
