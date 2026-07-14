import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ExplainabilityCard } from "@/components/governance/explainability-card";
import { explainabilityRecords } from "@/features/governance/explainability";
import { governanceMetrics } from "@/features/governance/metrics";

export default function GovernanceExplainabilityPage() {
  const avgConfidence = Math.round(
    explainabilityRecords.reduce((sum, record) => sum + record.confidence, 0) /
      explainabilityRecords.length
  );

  return (
    <>
      <PageHeader
        title="Explainability Center"
        context="Recent AI decisions with evidence, reasoning summary and business explanation."
        action={<Badge variant="primary">{governanceMetrics.explainabilityCoverage}% coverage</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-6 sm:col-span-3"><StatCard label="Recent Decisions" value={`${explainabilityRecords.length}`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Avg Confidence" value={`${avgConfidence}%`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Linked Executions" value={`${new Set(explainabilityRecords.map((record) => record.executionId)).size}`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Linked Recommendations" value={`${new Set(explainabilityRecords.map((record) => record.recommendationId)).size}`} /></div>

        {explainabilityRecords.map((record) => (
          <div key={record.id} className="col-span-12 xl:col-span-4">
            <ExplainabilityCard record={record} />
          </div>
        ))}
      </div>
    </>
  );
}
