import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegistryInsights } from "@/components/registries/registry-insights";
import { RegistryRecommendations } from "@/components/registries/registry-recommendations";
import { RegistryRiskSignals } from "@/components/registries/registry-risk-signals";
import {
  healthInterpretationForRegistry,
  overallRegistryInterpretation,
} from "@/features/registries/intelligence";
import { insightsForRegistry, registryOverviewInsights } from "@/features/registries/insights";
import {
  registryOverviewRiskSignals,
  riskSignalsForRegistry,
} from "@/features/registries/risk-signals";
import {
  recommendationsForRegistry,
  registryOverviewRecommendations,
} from "@/features/registries/recommendations";
import type { RegistryKey } from "@/features/registries/types";

function attentionVariant(attention: "healthy" | "watch" | "critical") {
  if (attention === "critical") return "error";
  if (attention === "watch") return "warning";
  return "success";
}

export function RegistryIntelligencePanel({
  registryId,
}: {
  registryId?: RegistryKey;
}) {
  const interpretation = registryId
    ? healthInterpretationForRegistry(registryId)
    : overallRegistryInterpretation;

  const insights = registryId
    ? insightsForRegistry(registryId)
    : registryOverviewInsights;
  const signals = registryId
    ? riskSignalsForRegistry(registryId)
    : registryOverviewRiskSignals;
  const recommendations = registryId
    ? recommendationsForRegistry(registryId)
    : registryOverviewRecommendations;

  if (!interpretation) return null;

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Registry Intelligence Panel</CardTitle>
            <Badge variant={attentionVariant(interpretation.attention)}>
              {interpretation.attention}
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-fg">
                {interpretation.title}
              </p>
              <p className="mt-1 text-sm text-fg-secondary">
                {interpretation.summary}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {interpretation.reasons.map((reason) => (
                <div
                  key={reason}
                  className="rounded-md border bg-surface-sunken p-3 text-sm text-fg-secondary"
                >
                  {reason}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 xl:col-span-4">
        <RegistryInsights insights={insights} />
      </div>
      <div className="col-span-12 xl:col-span-4">
        <RegistryRiskSignals signals={signals} />
      </div>
      <div className="col-span-12 xl:col-span-4">
        <RegistryRecommendations recommendations={recommendations} />
      </div>
    </div>
  );
}
