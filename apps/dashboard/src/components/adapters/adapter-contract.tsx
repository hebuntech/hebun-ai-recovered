import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SDK_CONTRACT_VERSION } from "@/features/adapters";

const contractMethods = [
  "supports", "initialize", "validate", "prepare", "execute",
  "pause", "resume", "cancel", "rollback", "shutdown", "health", "telemetry",
];

const resultFields = [
  "status", "duration", "startedAt", "finishedAt", "exitReason",
  "warnings", "errors", "events", "telemetry", "metrics",
  "rollbackAvailable", "retryAvailable", "humanInterventionRequired", "artifacts", "logs",
];

export function AdapterContract() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Contract</CardTitle>
        <Badge variant="info">v{SDK_CONTRACT_VERSION}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-muted">Contract methods ({contractMethods.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {contractMethods.map((m) => (
              <span key={m} className="rounded-sm border bg-surface-sunken px-2 py-0.5 font-mono text-xs text-fg-secondary">
                {m}()
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-muted">ExecutionResult fields ({resultFields.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {resultFields.map((f) => (
              <span key={f} className="rounded-sm border bg-surface-sunken px-2 py-0.5 font-mono text-xs text-fg-secondary">
                {f}
              </span>
            ))}
          </div>
        </div>
        <p className="text-xs text-fg-muted">
          New fields are optional and additive — existing adapters keep compiling. The contract version bumps only on breaking changes.
        </p>
      </CardContent>
    </Card>
  );
}
