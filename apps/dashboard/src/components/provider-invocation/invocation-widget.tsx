import Link from "next/link";
import { ArrowRight, PackageCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { invocationMetrics as m } from "@/features/provider-invocation";

export function InvocationWidget() {
  const tiles = [
    { label: "Prepared", value: `${m.preparedInvocations}/${m.totalInvocations}` },
    { label: "Simulation", value: `${m.simulationInvocations}` },
    { label: "Retry", value: `${m.retryCoverage}%` },
    { label: "Timeout", value: `${m.timeoutCoverage}%` },
    { label: "Audit", value: `${m.auditCoverage}%` },
    { label: "Health", value: `${m.invocationHealth}%` },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PackageCheck className="size-4 text-primary" />
          Provider Invocation Contract
        </CardTitle>
        <span className="text-xs text-fg-muted">defines how every provider is invoked</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">{t.label}</p>
              <p className="mt-1 text-sm font-bold text-fg tabular-nums">{t.value}</p>
            </div>
          ))}
        </div>
        <Link
          href="/director/provider-invocation"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Provider Invocation
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
