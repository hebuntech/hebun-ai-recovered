import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DomainReference } from "@/components/director/domain-reference";
import { recommendations } from "@/features/director/mock";

export default function IntelligenceRecommendationsPage() {
  const pending = recommendations.filter((r) => r.approvalStatus === "pending").length;

  return (
    <>
      <PageHeader
        title="AI Recommendations"
        context="Recommendation Engine output — owned by the AI Recommendations decision surface."
        action={<Badge variant="warning">{pending} pending</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <DomainReference
            title="AI Recommendations"
            description={`${recommendations.length} scored recommendations, ${pending} awaiting Director decision. Managed on the canonical AI Recommendations page.`}
            href="/director/recommendations"
            cta="Open AI Recommendations"
          />
        </div>
      </div>
    </>
  );
}
