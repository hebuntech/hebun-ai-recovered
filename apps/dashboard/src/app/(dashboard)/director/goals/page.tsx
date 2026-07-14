import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { GoalProgressCard } from "@/components/director/goal-progress-card";
import { strategicGoals } from "@/features/director/mock";

export default function StrategicGoalsPage() {
  const onTrack = strategicGoals.filter((g) => g.status === "on-track").length;
  const atRisk = strategicGoals.filter((g) => g.status === "at-risk").length;
  const blocked = strategicGoals.filter((g) => g.status === "blocked").length;

  return (
    <>
      <PageHeader
        title="Strategic Goals"
        context="Company-level goals, owners, progress and risk."
        action={<Badge variant="primary">{strategicGoals.length} goals</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 sm:col-span-4">
          <StatCard label="On Track" value={`${onTrack}`} caption="progressing" />
        </div>
        <div className="col-span-12 sm:col-span-4">
          <StatCard label="At Risk" value={`${atRisk}`} caption="needs attention" />
        </div>
        <div className="col-span-12 sm:col-span-4">
          <StatCard label="Blocked" value={`${blocked}`} caption="escalate" />
        </div>

        {strategicGoals.map((g) => (
          <div key={g.id} className="col-span-12 sm:col-span-6 xl:col-span-4">
            <GoalProgressCard goal={g} />
          </div>
        ))}
      </div>
    </>
  );
}
