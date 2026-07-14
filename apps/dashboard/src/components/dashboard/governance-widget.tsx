import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { governanceMetrics } from "@/features/governance/metrics";

export function GovernanceWidget() {
  const tiles = [
    { label: "Governance Health", value: `${governanceMetrics.health}` },
    { label: "Pending Approvals", value: `${governanceMetrics.pendingApprovals}` },
    { label: "Compliance", value: `${governanceMetrics.complianceScore}%` },
    { label: "Critical Risks", value: `${governanceMetrics.criticalRisks}` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="size-4 text-primary" />
          Governance
        </CardTitle>
        <span className="text-xs text-fg-muted">trust, compliance and control</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">{tile.label}</p>
              <p className="mt-1 text-lg font-bold tabular-nums">{tile.value}</p>
            </div>
          ))}
        </div>
        <Link
          href="/director/governance"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Governance Center
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
