import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvocationSummary } from "@/components/provider-invocation/invocation-summary";
import { InvocationPipeline } from "@/components/provider-invocation/invocation-pipeline";
import { InvocationRequestView } from "@/components/provider-invocation/invocation-request";
import { InvocationResponseView } from "@/components/provider-invocation/invocation-response";
import { InvocationLifecycle } from "@/components/provider-invocation/invocation-lifecycle";
import { InvocationArtifacts } from "@/components/provider-invocation/invocation-artifacts";
import { InvocationTelemetry } from "@/components/provider-invocation/invocation-telemetry";
import { InvocationEvents } from "@/components/provider-invocation/invocation-events";
import { InvocationAudit } from "@/components/provider-invocation/invocation-audit";
import { invocationContractClauses } from "@/features/provider-invocation";

export function InvocationPanel() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <InvocationSummary />

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Provider Invocation Contract</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-fg-secondary">
              Routing decides which provider is used; the invocation contract defines how every
              provider is invoked. This is the universal invocation model every provider must
              implement — lifecycle, request, expected response, artifacts, retry, timeout, rollback,
              cancellation, telemetry, audit and events. Deterministic, explainable and offline: no
              real execution, API calls, SDKs, credentials, network or LLM access.
            </p>
            <ul className="flex flex-col gap-1">
              {invocationContractClauses.map((c) => (
                <li key={c} className="text-xs text-fg-muted">
                  · {c}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <InvocationPipeline />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <InvocationRequestView />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <InvocationResponseView />
      </div>

      <div className="col-span-12">
        <InvocationLifecycle />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <InvocationArtifacts />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <InvocationEvents />
      </div>

      <div className="col-span-12">
        <InvocationTelemetry />
      </div>

      <div className="col-span-12">
        <InvocationAudit />
      </div>
    </div>
  );
}
