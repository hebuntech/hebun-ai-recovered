import { Grid3x3 } from "lucide-react";
import { ProviderMatrixPanel } from "@/components/provider-matrix/provider-matrix-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { providerMatrixMetrics } from "@/features/provider-matrix";

export default function ProviderMatrixPage() {
  return (
    <>
      <PageHeader
        title="Provider Capability Matrix"
        context="The centralized source of truth for every provider — capability matrix, routing intelligence, execution modes, overlap and gap analysis, priority, scores and network health. Providers no longer own routing logic; it is derived here deterministically and offline."
        action={
          <Badge variant={providerMatrixMetrics.badge}>Health {providerMatrixMetrics.overallHealth}%</Badge>
        }
      />

      <div className="mb-6 flex items-center gap-2 text-sm text-fg-secondary">
        <Grid3x3 className="size-4 text-primary" />
        No API calls, no runtime routing, no provider changes. Deterministic intelligence over the six
        registered providers.
      </div>

      <ProviderMatrixPanel />
    </>
  );
}
