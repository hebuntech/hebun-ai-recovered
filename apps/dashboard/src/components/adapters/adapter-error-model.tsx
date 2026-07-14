import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import {
  errorCodeCatalog,
  defaultRetryPolicy,
  retrySchedule,
  defaultTimeoutPolicy,
  defaultCircuitConfig,
  type ErrorSeverity,
} from "@/features/adapters";

const severityVariant: Record<ErrorSeverity, BadgeVariant> = {
  info: "neutral",
  warning: "warning",
  recoverable: "info",
  fatal: "error",
};

export function AdapterErrorModel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Model</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{errorCodeCatalog.length} codes</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="ui-table-wrap">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-fg-muted">
                <th className="px-4 py-2 font-medium">Code</th>
                <th className="px-4 py-2 font-medium">Severity</th>
                <th className="px-4 py-2 font-medium">Recoverable</th>
                <th className="px-4 py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {errorCodeCatalog.map((e) => (
                <tr key={e.code} className="border-b last:border-0">
                  <td className="px-4 py-2 font-mono text-xs text-fg">{e.code}</td>
                  <td className="px-4 py-2"><Badge variant={severityVariant[e.severity]}>{e.severity}</Badge></td>
                  <td className="px-4 py-2 text-fg-secondary">{e.recoverable ? "yes" : "no"}</td>
                  <td className="px-4 py-2 text-fg-secondary">{e.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md border bg-surface-sunken p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">Retry Policy</p>
            <p className="mt-1 text-sm text-fg">{defaultRetryPolicy.maxAttempts} attempts · ×{defaultRetryPolicy.multiplier}</p>
            <p className="text-xs text-fg-muted tabular-nums">backoff {retrySchedule().map((d) => `${d / 1000}s`).join(" → ")}</p>
          </div>
          <div className="rounded-md border bg-surface-sunken p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">Timeout Policy</p>
            <p className="mt-1 text-sm text-fg">default {defaultTimeoutPolicy.defaultMs / 1000}s</p>
            <p className="text-xs text-fg-muted tabular-nums">hard cap {defaultTimeoutPolicy.hardCapMs / 1000}s</p>
          </div>
          <div className="rounded-md border bg-surface-sunken p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">Circuit Breaker</p>
            <p className="mt-1 text-sm text-fg">open at {defaultCircuitConfig.failureThreshold} failures</p>
            <p className="text-xs text-fg-muted tabular-nums">cooldown {defaultCircuitConfig.cooldownMs / 1000}s</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
