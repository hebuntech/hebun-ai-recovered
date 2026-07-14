import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdapterSummary } from "@/components/adapters/adapter-summary";
import { AdapterRegistry } from "@/components/adapters/adapter-registry";
import { AdapterCapabilities } from "@/components/adapters/adapter-capabilities";
import { AdapterHealth } from "@/components/adapters/adapter-health";
import { AdapterLifecycle } from "@/components/adapters/adapter-lifecycle";
import { AdapterEventsCard } from "@/components/adapters/adapter-events";
import { AdapterTelemetryCard } from "@/components/adapters/adapter-telemetry";
import { AdapterSimulation } from "@/components/adapters/adapter-simulation";
import { AdapterAudit } from "@/components/adapters/adapter-audit";
import { AdapterContract } from "@/components/adapters/adapter-contract";
import { AdapterErrorModel } from "@/components/adapters/adapter-error-model";
import { AdapterDiagnostics } from "@/components/adapters/adapter-diagnostics";
import { AdapterLifecycleValidation } from "@/components/adapters/adapter-lifecycle-validation";
import { AdapterHealthDiagnostics } from "@/components/adapters/adapter-health-diagnostics";
import { AdapterTelemetryMetrics } from "@/components/adapters/adapter-telemetry-metrics";

export function AdapterPanel() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <AdapterSummary />

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Execution Adapter SDK</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-fg-secondary">
              A provider-independent SDK every future execution provider implements. The
              Execution Engine never knows how a provider works — it drives adapters through a
              common contract: registration, discovery, capability matching, lifecycle,
              validation, health, telemetry and an event bridge. Only the deterministic
              Simulation Adapter exists today.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <AdapterRegistry />
      </div>

      <div className="col-span-12">
        <AdapterLifecycle />
      </div>

      <div className="col-span-12">
        <AdapterCapabilities />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <AdapterHealth />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <AdapterTelemetryCard />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <AdapterSimulation />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <AdapterEventsCard />
      </div>

      {/* ── Phase 32: Contract Audit & Hardening ── */}
      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Contract Audit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-fg-secondary">
              Architectural hardening pass. Every public contract is reviewed and strengthened
              with version-safe optional fields so the SDK can support dozens of future providers
              without breaking changes. No provider adapters or external integrations exist.
            </p>
          </CardContent>
        </Card>
      </div>

      <AdapterAudit />

      <div className="col-span-12">
        <AdapterDiagnostics />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <AdapterContract />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <AdapterLifecycleValidation />
      </div>

      <div className="col-span-12">
        <AdapterErrorModel />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <AdapterHealthDiagnostics />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <AdapterTelemetryMetrics />
      </div>
    </div>
  );
}
