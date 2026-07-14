import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RecommendationCard } from "@/components/director/recommendation-card";
import { DataStateBadge } from "@/components/dashboard/data-state-badge";
import { recommendations } from "@/features/director/mock";

const visibleRecommendations = recommendations
  .filter((recommendation) => recommendation.approvalStatus !== "rejected")
  .slice(0, 3);

export function RecommendedDecisionsPanel() {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-fg-muted">
            Recommended Decisions
          </p>
          <h3 className="text-xl font-semibold leading-8 text-fg">The best next decisions, with rationale</h3>
          <p className="max-w-3xl text-sm leading-6 text-fg-secondary">
            Recommendations stay visible, but only the few with the strongest expected business
            impact keep prime placement.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DataStateBadge state="DERIVED" />
          <DataStateBadge state="SIMULATION" />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {visibleRecommendations.map((recommendation) => (
          <RecommendationCard key={recommendation.id} rec={recommendation} />
        ))}
      </div>

      <Link
        href="/director/recommendations"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
      >
        Open all recommendations
        <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}
