import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { governanceStatusVariant } from "@/components/governance/governance-tokens";
import type { GovernancePolicy } from "@/features/governance/types";

export function PolicyCard({ policy }: { policy: GovernancePolicy }) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-fg">{policy.name}</h3>
            <p className="text-sm text-fg-secondary">{policy.impact}</p>
          </div>
          <Badge variant={governanceStatusVariant[policy.status]}>{policy.status}</Badge>
        </div>
        <div className="mt-auto flex flex-wrap gap-2 text-xs text-fg-muted">
          <span>{policy.domain}</span>
          <span>·</span>
          <span>{policy.version}</span>
          <span>·</span>
          <span>{policy.owner}</span>
          <span>·</span>
          <span>{policy.updated}</span>
        </div>
      </CardContent>
    </Card>
  );
}
