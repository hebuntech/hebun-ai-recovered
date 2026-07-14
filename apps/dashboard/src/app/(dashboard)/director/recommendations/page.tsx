import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { RecommendationCard } from "@/components/director/recommendation-card";
import { recommendations } from "@/features/director/mock";

export default function AiRecommendationsPage() {
  const pending = recommendations.filter((r) => r.approvalStatus === "pending").length;
  const approved = recommendations.filter((r) => r.approvalStatus === "approved").length;
  const avgConfidence = Math.round(
    recommendations.reduce((a, r) => a + r.confidence, 0) / recommendations.length
  );

  return (
    <>
      <PageHeader
        title="AI Recommendations"
        context="Recommendation Engine output — scored, prioritized, awaiting decision."
        action={<Badge variant="warning">{pending} pending</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 sm:col-span-4">
          <StatCard label="Pending" value={`${pending}`} caption="need Director decision" />
        </div>
        <div className="col-span-12 sm:col-span-4">
          <StatCard label="Approved" value={`${approved}`} caption="in rollout" />
        </div>
        <div className="col-span-12 sm:col-span-4">
          <StatCard label="Avg Confidence" value={`${avgConfidence}%`} caption="across recommendations" />
        </div>

        {recommendations.map((r) => (
          <div key={r.id} className="col-span-12 sm:col-span-6 xl:col-span-4">
            <RecommendationCard rec={r} />
          </div>
        ))}
      </div>
    </>
  );
}
