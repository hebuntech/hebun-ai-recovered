import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { activationDecisions } from "@/features/runtime-activation";

export function ActivationReport() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activation Report</CardTitle>
        <span className="text-xs text-fg-muted">final explainable decision output</span>
      </CardHeader>
      <CardContent className="ui-table-wrap">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-fg-muted">
            <tr>
              <th className="pb-3">Provider</th>
              <th className="pb-3">Level</th>
              <th className="pb-3">Readiness</th>
              <th className="pb-3">Risk</th>
              <th className="pb-3">Approval</th>
              <th className="pb-3">Policy</th>
              <th className="pb-3">Environment</th>
            </tr>
          </thead>
          <tbody>
            {activationDecisions.map((decision) => (
              <tr key={decision.id} className="border-t border-border/60 align-top">
                <td className="py-3 pr-3 font-medium text-fg">{decision.providerId ?? "unassigned"}</td>
                <td className="py-3 pr-3">
                  <Badge variant={decision.badge}>{decision.activationLevel}</Badge>
                </td>
                <td className="py-3 pr-3 text-fg-secondary">{decision.readinessScore}%</td>
                <td className="py-3 pr-3 text-fg-secondary">{decision.riskLevel}</td>
                <td className="py-3 pr-3 text-fg-secondary">{decision.approvalStatus}</td>
                <td className="py-3 pr-3 text-fg-secondary">{decision.policyStatus}</td>
                <td className="py-3 pr-3 text-fg-secondary">{decision.environmentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
