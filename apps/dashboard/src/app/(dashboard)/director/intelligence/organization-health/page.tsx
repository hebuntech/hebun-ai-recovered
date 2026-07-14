import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DomainReference } from "@/components/director/domain-reference";
import { RiskHeatmap } from "@/components/intelligence/risk-heatmap";
import { ForecastCard } from "@/components/intelligence/forecast-card";
import { TrendListPanel } from "@/components/intelligence/trend-list-panel";
import { forecasts, riskTrends, intelligenceScores } from "@/features/intelligence/mock";

export default function OrganizationIntelligencePage() {
  const capacity = forecasts.find((f) => f.kind === "capacity");
  const performance = forecasts.find((f) => f.kind === "performance");

  return (
    <>
      <PageHeader
        title="Organization Intelligence"
        context="Department intelligence, capability maturity, risk and capacity forecast."
        action={<Badge variant="success">Health {intelligenceScores.organizationHealth}</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <DomainReference
            title="Department Health Matrix"
            description="Per-department health, capacity, efficiency, AI utilization and risk are owned by Organization Health."
            href="/director/organization-health"
            cta="Open Organization Health"
          />
        </div>

        <div className="col-span-12">
          <RiskHeatmap />
        </div>

        {capacity && (
          <div className="col-span-12 sm:col-span-6"><ForecastCard forecast={capacity} /></div>
        )}
        {performance && (
          <div className="col-span-12 sm:col-span-6"><ForecastCard forecast={performance} /></div>
        )}

        <div className="col-span-12">
          <TrendListPanel title="Emerging Risks" items={riskTrends} upIsGood={false} />
        </div>
      </div>
    </>
  );
}
