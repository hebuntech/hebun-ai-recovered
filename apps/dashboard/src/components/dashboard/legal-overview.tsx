import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { legalOverview as l } from "@/features/legal/mock";

export function LegalOverview() {
  const metrics = [
    { label: "Open Legal Reviews", value: `${l.openReviews}`, intent: "flat" },
    { label: "Contracts Waiting Review", value: `${l.contractsWaitingReview}`, intent: "flat" },
    { label: "High Risk Contracts", value: `${l.highRiskContracts}`, intent: "bad" },
    { label: "Compliance Score", value: `${l.complianceScore}%`, intent: "up" },
    { label: "Open Policy Updates", value: `${l.openPolicyUpdates}`, intent: "flat" },
    { label: "Regulatory Alerts", value: `${l.regulatoryAlerts}`, intent: "bad" },
    { label: "IP Assets", value: `${l.ipAssets}`, intent: "flat" },
    { label: "Trademark Renewals", value: `${l.trademarkRenewals}`, intent: "flat" },
    { label: "Legal Approval Queue", value: `${l.approvalQueue}`, intent: "flat" },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Legal Overview</CardTitle>
        <span className="text-xs text-fg-muted">Legal Department</span>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-md border bg-surface-sunken p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
              {m.label}
            </p>
            <p
              className={cn(
                "mt-1 text-xl font-bold tabular-nums",
                m.intent === "bad" && "text-error"
              )}
            >
              {m.value}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
