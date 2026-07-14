import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { governanceResults, latestGovernanceResult } from "@/features/policy";
import { PolicyApprovals } from "@/components/policy/policy-approvals";
import { PolicyAudit } from "@/components/policy/policy-audit";
import { PolicyCompliance } from "@/components/policy/policy-compliance";
import { PolicyExplanation } from "@/components/policy/policy-explanation";
import { PolicyPermissions } from "@/components/policy/policy-permissions";
import { PolicyPipeline } from "@/components/policy/policy-pipeline";
import { PolicyRisk } from "@/components/policy/policy-risk";
import { PolicyRules } from "@/components/policy/policy-rules";
import { PolicySummary } from "@/components/policy/policy-summary";

export function PolicyPanel() {
  const result = latestGovernanceResult();
  if (!result) return null;

  return (
    <div className="grid grid-cols-12 gap-6">
      <PolicySummary />

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Policy Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-fg-secondary">
              The Policy & Governance Engine evaluates whether a reasoning result is allowed, compliant, safe, and properly authorized before any future planning system can act on it.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <PolicyPipeline />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <PolicyRules result={result} />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <PolicyPermissions result={result} />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <PolicyCompliance result={result} />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <PolicyRisk result={result} />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <PolicyApprovals result={result} />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <Card>
          <CardHeader>
            <CardTitle>Governance Decision</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="text-sm font-semibold text-fg">{result.governanceDecision.summary}</p>
              <p className="mt-1 text-sm text-fg-secondary">{result.governanceDecision.rationale}</p>
              <p className="mt-2 text-xs text-fg-muted">
                {result.governanceDecision.status} · confidence {result.confidence}
              </p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                Allowed Actions
              </p>
              <div className="mt-2 flex flex-col gap-2 text-sm text-fg-secondary">
                {result.allowedActions.map((action) => (
                  <p key={action}>{action}</p>
                ))}
              </div>
            </div>
            {result.blockedActions.length > 0 && (
              <div className="rounded-md border bg-surface-sunken p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                  Blocked Actions
                </p>
                <div className="mt-2 flex flex-col gap-2 text-sm text-fg-secondary">
                  {result.blockedActions.map((action) => (
                    <p key={action}>{action}</p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 xl:col-span-6">
        <PolicyAudit result={result} />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <PolicyExplanation result={result} />
      </div>

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Decision History</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {governanceResults.map((item) => (
              <div key={item.id} className="rounded-md border bg-surface-sunken p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-fg">{item.reasoning.context.title}</p>
                  <p className="text-sm text-fg-secondary">{item.governanceDecision.status}</p>
                </div>
                <p className="mt-1 text-sm text-fg-secondary">{item.governanceDecision.summary}</p>
                <p className="mt-2 text-xs text-fg-muted">
                  {item.timestamp.slice(0, 10)} · {item.confidence} confidence
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
