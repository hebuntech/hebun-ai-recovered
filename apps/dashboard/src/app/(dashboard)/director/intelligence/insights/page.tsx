import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { ExecutiveInsightPanel } from "@/components/intelligence/executive-insight-panel";
import { ForecastCard } from "@/components/intelligence/forecast-card";
import { TrendListPanel } from "@/components/intelligence/trend-list-panel";
import { DomainReference } from "@/components/director/domain-reference";
import { forecasts, riskTrends, opportunityTrends } from "@/features/intelligence/mock";

export default function StrategicForecastsPage() {
  return (
    <>
      <PageHeader
        title="Strategic Forecasts"
        context="Forward-looking intelligence — predictions, business forecasts, and emerging risk and opportunity signals."
        action={<Badge variant="info">Strategic Intelligence</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <ExecutiveInsightPanel />
        </div>

        {/* Insight cards are owned by Executive Insights */}
        <div className="col-span-12">
          <DomainReference
            title="Executive Insights"
            description="Opportunity, risk and attention insight cards are owned by the Executive Insights page."
            href="/director/insights"
            cta="Open Executive Insights"
          />
        </div>

        {/* Forecasts */}
        <div className="col-span-12">
          <h3 className="mb-1 text-sm font-semibold text-fg">Business Forecasts</h3>
        </div>
        {forecasts.map((f) => (
          <div key={f.id} className="col-span-12 sm:col-span-6 xl:col-span-3">
            <ForecastCard forecast={f} />
          </div>
        ))}

        {/* Risk + opportunity */}
        <div className="col-span-12 xl:col-span-6">
          <TrendListPanel title="Emerging Risks" items={riskTrends} upIsGood={false} />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <TrendListPanel title="Emerging Opportunities" items={opportunityTrends} upIsGood />
        </div>
      </div>
    </>
  );
}
