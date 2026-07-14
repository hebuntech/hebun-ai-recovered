import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivationAudit } from "@/components/runtime-activation/activation-audit";
import { ActivationCredentials } from "@/components/runtime-activation/activation-credentials";
import { ActivationGates } from "@/components/runtime-activation/activation-gates";
import { ActivationPipeline } from "@/components/runtime-activation/activation-pipeline";
import { ActivationReadiness } from "@/components/runtime-activation/activation-readiness";
import { ActivationReport } from "@/components/runtime-activation/activation-report";
import { ActivationRisk } from "@/components/runtime-activation/activation-risk";
import { ActivationSummary } from "@/components/runtime-activation/activation-summary";
import { activationFrameworkClauses } from "@/features/runtime-activation";

export function ActivationPanel() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <ActivationSummary />

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Live Runtime Activation Framework</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-fg-secondary">
              Runtime Activation is the provider-independent control layer that decides whether a runtime
              may leave simulation-oriented execution modes. It references the existing runtime boundary,
              provider matrix and invocation layers, and stays fully deterministic and offline in this phase.
            </p>
            <ul className="flex flex-col gap-1">
              {activationFrameworkClauses.map((clause) => (
                <li key={clause} className="text-xs text-fg-muted">
                  · {clause}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <ActivationPipeline />
      </div>

      <div className="col-span-12">
        <ActivationGates />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <ActivationReadiness />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <ActivationCredentials />
      </div>

      <div className="col-span-12">
        <ActivationRisk />
      </div>

      <div className="col-span-12">
        <ActivationReport />
      </div>

      <div className="col-span-12">
        <ActivationAudit />
      </div>
    </div>
  );
}
