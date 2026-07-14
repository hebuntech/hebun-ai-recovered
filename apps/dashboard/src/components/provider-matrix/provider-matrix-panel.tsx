import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProviderMatrixSummary } from "@/components/provider-matrix/provider-matrix-summary";
import { ProviderNetwork } from "@/components/provider-matrix/provider-network";
import { ProviderCapabilityMatrix } from "@/components/provider-matrix/provider-capability-matrix";
import { ProviderRouting } from "@/components/provider-matrix/provider-routing";
import { ProviderOverlap } from "@/components/provider-matrix/provider-overlap";
import { ProviderGaps } from "@/components/provider-matrix/provider-gaps";
import { ProviderScore } from "@/components/provider-matrix/provider-score";
import { ProviderHealth } from "@/components/provider-matrix/provider-health";

export function ProviderMatrixPanel() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <ProviderMatrixSummary />

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Centralized Provider Intelligence</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-fg-secondary">
              The Provider Capability Matrix is the single source of truth for every provider in the
              system. It answers which provider supports which capability, who is primary vs fallback,
              where capabilities overlap and which capabilities have no provider yet. Providers no
              longer own routing logic — routing, priority, overlap, gaps and scores are all derived
              here, deterministically and offline. No API calls, no runtime routing, no provider
              changes.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <ProviderNetwork />
      </div>

      <div className="col-span-12">
        <ProviderCapabilityMatrix />
      </div>

      <div className="col-span-12">
        <ProviderRouting />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <ProviderOverlap />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <ProviderScore />
      </div>

      <div className="col-span-12">
        <ProviderGaps />
      </div>

      <div className="col-span-12">
        <ProviderHealth />
      </div>
    </div>
  );
}
