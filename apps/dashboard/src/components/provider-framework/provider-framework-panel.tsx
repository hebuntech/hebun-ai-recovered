import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProviderFrameworkSummary } from "@/components/provider-framework/provider-framework-summary";
import { ProviderContract } from "@/components/provider-framework/provider-contract";
import { ProviderCapabilities } from "@/components/provider-framework/provider-capabilities";
import { ProviderConfigSchema } from "@/components/provider-framework/provider-config";
import { ProviderNormalization } from "@/components/provider-framework/provider-normalization";
import { ProviderSimulation } from "@/components/provider-framework/provider-simulation";
import { ProviderConformance } from "@/components/provider-framework/provider-conformance";
import { ProviderTestHarness } from "@/components/provider-framework/provider-test-harness";

export function ProviderFrameworkPanel() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <ProviderFrameworkSummary />

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Framework Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-fg-secondary">
              The Provider Adapter Framework sits between the Execution Adapter SDK and concrete
              providers. It standardizes provider contracts, capability mapping, configuration,
              request/response/error normalization, simulation and conformance — so dozens of
              future providers can be added without SDK changes. No real provider exists yet.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <ProviderContract />
      </div>

      <div className="col-span-12">
        <ProviderCapabilities />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <ProviderConfigSchema />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <ProviderSimulation />
      </div>

      <div className="col-span-12">
        <ProviderNormalization />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <ProviderConformance />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <ProviderTestHarness />
      </div>
    </div>
  );
}
