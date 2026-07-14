import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { EventTimeline } from "@/components/dashboard/event-timeline";
import { IntelligenceSummary } from "@/components/intelligence/intelligence-summary";
import { ExecutiveInsightPanel } from "@/components/intelligence/executive-insight-panel";
import { PatternCard } from "@/components/intelligence/pattern-card";
import { TrendListPanel } from "@/components/intelligence/trend-list-panel";
import { RecommendationCard } from "@/components/director/recommendation-card";
import { DepartmentMatrix } from "@/components/director/department-matrix";
import { patterns, opportunityTrends, intelligenceScores } from "@/features/intelligence/mock";
import { recommendations, executiveTimeline } from "@/features/director/mock";

export default function IntelligenceOverviewPage() {
  return (
    <>
      <PageHeader
        title="Intelligence Center"
        context="What the organization has learned, discovered, and recommends."
        action={<Badge variant="success">Org Intelligence {intelligenceScores.organizationIntelligence}</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        <IntelligenceSummary />

        <div className="col-span-12">
          <ExecutiveInsightPanel />
        </div>

        {/* Active recommendations */}
        <div className="col-span-12">
          <h3 className="mb-1 text-sm font-semibold text-fg">Active Recommendations</h3>
        </div>
        {recommendations.filter((r) => r.approvalStatus === "pending").slice(0, 3).map((r) => (
          <div key={r.id} className="col-span-12 sm:col-span-6 xl:col-span-4">
            <RecommendationCard rec={r} />
          </div>
        ))}

        {/* Top patterns */}
        <div className="col-span-12">
          <h3 className="mb-1 text-sm font-semibold text-fg">Top Patterns</h3>
        </div>
        {patterns.slice(0, 3).map((p) => (
          <div key={p.id} className="col-span-12 sm:col-span-6 xl:col-span-4">
            <PatternCard pattern={p} />
          </div>
        ))}

        {/* Org health + opportunities */}
        <div className="col-span-12 xl:col-span-8">
          <DepartmentMatrix title="Organization Health" />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <TrendListPanel title="Strategic Opportunities" items={opportunityTrends} upIsGood />
        </div>

        {/* Timeline */}
        <div className="col-span-12">
          <EventTimeline events={executiveTimeline} title="Executive Timeline" />
        </div>
      </div>
    </>
  );
}
