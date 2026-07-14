import Link from "next/link";
import { ArrowRight, Network } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { orgDepartments, organizationSummary as s } from "@/features/organization/mock";
import { orgStatusVariant, healthTone } from "@/components/organization/org-tokens";
import { Badge } from "@/components/ui/badge";

export function OrganizationHealthWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="size-4 text-primary" />
          Organization Health
        </CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">
          {s.departmentsOnline}/{s.departmentsTotal} online · {s.activeAgents} agents active
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {orgDepartments.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-md border bg-surface-sunken px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-fg">{d.name}</p>
                <Badge variant={orgStatusVariant[d.status]}>{d.status}</Badge>
              </div>
              <span className={cn("text-sm font-bold tabular-nums", healthTone(d.health))}>{d.health}</span>
            </div>
          ))}
        </div>
        <Link
          href="/director/organization"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Live Organization
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
