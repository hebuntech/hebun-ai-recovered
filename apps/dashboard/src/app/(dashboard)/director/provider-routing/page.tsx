import { Route } from "lucide-react";
import { RoutingPanel } from "@/components/provider-routing/routing-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { routingMetrics } from "@/features/provider-routing";

export default function ProviderRoutingPage() {
  return (
    <>
      <PageHeader
        title="Provider Routing Engine"
        context="Selects the most appropriate provider(s) for every execution request and explains why. Sits between the Planning / Execution Engine and the Provider Framework, deriving all provider data from the Provider Capability Matrix. Deterministic, explainable and offline."
        action={<Badge variant={routingMetrics.badge}>Routing {routingMetrics.routingHealth}%</Badge>}
      />

      <div className="mb-6 flex items-center gap-2 text-sm text-fg-secondary">
        <Route className="size-4 text-primary" />
        No real execution, no API calls, no runtime provider invocation. Deterministic selection over
        the six registered providers.
      </div>

      <RoutingPanel />
    </>
  );
}
