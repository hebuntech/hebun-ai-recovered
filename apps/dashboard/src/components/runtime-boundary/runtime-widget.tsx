import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { runtimeMetrics as m } from "@/features/runtime-boundary";

export function RuntimeWidget() {
  const tiles = [
    { label: "Runtime Health", value: `${m.runtimeHealth}%` },
    { label: "Simulation", value: `${m.simulationCoverage}%` },
    { label: "Promotion", value: `${m.promotionReadiness}%` },
    { label: "Blocked", value: `${m.blockedInvocations}` },
    { label: "Approval", value: `${m.approvalQueue}` },
    { label: "Credential PH", value: `${m.credentialPlaceholders}` },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="size-4 text-primary" />
          Live Provider Runtime Boundary
        </CardTitle>
        <span className="text-xs text-fg-muted">final safety gate before live execution</span>
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
          href="/director/runtime"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Runtime Boundary
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
