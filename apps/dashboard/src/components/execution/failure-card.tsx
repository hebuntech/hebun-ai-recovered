import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  failureClassVariant,
  failureClassLabel,
  recoveryLabel,
  escalationVariant,
} from "@/components/execution/execution-tokens";
import type { FailureRecord } from "@/features/execution/mock";

export function FailureCard({ failure }: { failure: FailureRecord }) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={cn("size-2.5 rounded-full", failure.severity === "error" ? "bg-error" : "bg-warning")} />
            <span className="font-mono text-xs text-fg-muted">{failure.execution}</span>
          </div>
          <Badge variant={failureClassVariant[failure.classification]}>
            {failureClassLabel[failure.classification]}
          </Badge>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-fg">Failed node: {failure.failedNode}</h3>
          <p className="mt-1 text-sm text-fg-secondary">{failure.rootCause}</p>
        </div>

        <div className="mt-auto flex flex-col gap-2 border-t pt-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-fg-muted">Recovery</span>
            <span className="font-medium text-fg">{recoveryLabel[failure.recoveryStrategy]}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-fg-muted">Retries · Escalation</span>
            <span className="flex items-center gap-2">
              <span className="tabular-nums text-fg-secondary">{failure.retryCount}</span>
              <Badge variant={escalationVariant[failure.escalation]}>{failure.escalation}</Badge>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-fg-muted">Owner · Last attempt</span>
            <span className="text-fg-secondary">{failure.owner} · {failure.lastAttempt}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-fg-muted">Next action</span>
            <span className="font-medium text-primary">{failure.nextAction}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
