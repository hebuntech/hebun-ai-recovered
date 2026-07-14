import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoutingSummary } from "@/components/provider-routing/routing-summary";
import { RoutingPipeline } from "@/components/provider-routing/routing-pipeline";
import { ProviderSelection } from "@/components/provider-routing/provider-selection";
import { CapabilityMatching } from "@/components/provider-routing/capability-matching";
import { FallbackChain } from "@/components/provider-routing/fallback-chain";
import { RoutingStrategyList } from "@/components/provider-routing/routing-strategy";
import { RoutingHealth } from "@/components/provider-routing/routing-health";
import { RoutingReport } from "@/components/provider-routing/routing-report";

export function RoutingPanel() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <RoutingSummary />

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Provider Routing Engine</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-fg-secondary">
              The routing engine sits between the Planning / Execution Engine and the Provider
              Framework. For every execution request it selects the most appropriate provider(s),
              assigns a fallback chain and explains the decision. Everything derives from the
              Provider Capability Matrix — deterministic, explainable and offline. No real execution,
              no API calls, no runtime provider invocation.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <RoutingPipeline />
      </div>

      <div className="col-span-12">
        <ProviderSelection />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <CapabilityMatching />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <FallbackChain />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <RoutingStrategyList />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <RoutingHealth />
      </div>

      <div className="col-span-12">
        <RoutingReport />
      </div>
    </div>
  );
}
