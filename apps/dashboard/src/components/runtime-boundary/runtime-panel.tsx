import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RuntimeSummary } from "@/components/runtime-boundary/runtime-summary";
import { RuntimePipeline } from "@/components/runtime-boundary/runtime-pipeline";
import { RuntimeGates } from "@/components/runtime-boundary/runtime-gates";
import { RuntimeReadiness } from "@/components/runtime-boundary/runtime-readiness";
import { RuntimeCredentials } from "@/components/runtime-boundary/runtime-credentials";
import { RuntimeHealth } from "@/components/runtime-boundary/runtime-health";
import { RuntimePromotion } from "@/components/runtime-boundary/runtime-promotion";
import { RuntimeAudit } from "@/components/runtime-boundary/runtime-audit";
import { RuntimeReport } from "@/components/runtime-boundary/runtime-report";
import { runtimeBoundaryClauses } from "@/features/runtime-boundary";

export function RuntimePanel() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <RuntimeSummary />

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Live Provider Runtime Boundary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-fg-secondary">
              This is the final safety boundary before real provider execution. It does not execute
              providers — it decides whether an invocation may cross from the deterministic offline
              world into a future live runtime. In this phase nothing crosses: live runtime is
              disabled and every invocation is held on the offline side. Deterministic, explainable,
              auditable and offline — no execution, APIs, SDKs, credentials, env access, secret
              managers, network or LLM.
            </p>
            <ul className="flex flex-col gap-1">
              {runtimeBoundaryClauses.map((c) => (
                <li key={c} className="text-xs text-fg-muted">
                  · {c}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <RuntimePipeline />
      </div>

      <div className="col-span-12">
        <RuntimeGates />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <RuntimeReadiness />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <RuntimeCredentials />
      </div>

      <div className="col-span-12">
        <RuntimeHealth />
      </div>

      <div className="col-span-12">
        <RuntimePromotion />
      </div>

      <div className="col-span-12">
        <RuntimeReport />
      </div>

      <div className="col-span-12">
        <RuntimeAudit />
      </div>
    </div>
  );
}
