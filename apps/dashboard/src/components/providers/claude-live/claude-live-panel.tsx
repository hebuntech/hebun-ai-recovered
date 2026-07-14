import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClaudeLiveAudit } from "@/components/providers/claude-live/claude-live-audit";
import { ClaudeLiveDryRun } from "@/components/providers/claude-live/claude-live-dry-run";
import { ClaudeLiveEligibilityCard } from "@/components/providers/claude-live/claude-live-eligibility";
import { ClaudeLiveRequestPreview } from "@/components/providers/claude-live/claude-live-request";
import { ClaudeLiveResponsePreview } from "@/components/providers/claude-live/claude-live-response";
import { ClaudeLiveSummary } from "@/components/providers/claude-live/claude-live-summary";
import { ClaudeLiveTelemetryCard } from "@/components/providers/claude-live/claude-live-telemetry";
import { claudeLiveRecord } from "@/features/providers/claude-live";

export function ClaudeLivePanel() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <ClaudeLiveSummary />

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Claude Live Integration Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-fg-secondary">
            <p>
              Claude Live Integration is gated behind Provider Invocation, Runtime Boundary, and Runtime Activation.
              This phase proves the smallest safe live path by supporting summarization only, defaulting to Dry Run,
              and keeping deterministic simulation fallback mandatory.
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="rounded-md border bg-surface-sunken p-4">
                <p className="text-xs uppercase tracking-wider text-fg-secondary">Supported Capability</p>
                <p className="mt-1 font-semibold text-fg">{claudeLiveRecord.capability}</p>
              </div>
              <div className="rounded-md border bg-surface-sunken p-4">
                <p className="text-xs uppercase tracking-wider text-fg-secondary">Activation Gate</p>
                <p className="mt-1 font-semibold text-fg">{claudeLiveRecord.eligibility.activationLevel ?? "not linked"}</p>
              </div>
              <div className="rounded-md border bg-surface-sunken p-4">
                <p className="text-xs uppercase tracking-wider text-fg-secondary">Simulation Fallback</p>
                <p className="mt-1 font-semibold text-fg">{claudeLiveRecord.simulationFallback.prepared ? "Prepared" : "Missing"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 xl:col-span-6">
        <ClaudeLiveEligibilityCard />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <ClaudeLiveDryRun />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <ClaudeLiveRequestPreview />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <ClaudeLiveResponsePreview />
      </div>

      <div className="col-span-12">
        <ClaudeLiveTelemetryCard />
      </div>

      <div className="col-span-12">
        <ClaudeLiveAudit />
      </div>
    </div>
  );
}
