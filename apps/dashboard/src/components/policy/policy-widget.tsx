import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { policyMetrics } from "@/features/policy";

export function PolicyWidget() {
  const tiles = [
    { label: "Policy Health", value: `${policyMetrics.policyHealth}` },
    { label: "Compliance", value: `${policyMetrics.complianceScore}` },
    { label: "Open Approvals", value: `${policyMetrics.openApprovals}` },
    { label: "Blocked", value: `${policyMetrics.blockedDecisions}` },
    { label: "High Risk", value: `${policyMetrics.highRiskDecisions}` },
    { label: "Audit", value: policyMetrics.auditStatus },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="size-4 text-primary" />
          Policy & Governance
        </CardTitle>
        <span className="text-xs text-fg-muted">
          deterministic governance gate between reasoning and planning
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                {tile.label}
              </p>
              <p className="mt-1 text-sm font-bold text-fg">{tile.value}</p>
            </div>
          ))}
        </div>
        <Link
          href="/director/policy"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Policy & Governance
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
