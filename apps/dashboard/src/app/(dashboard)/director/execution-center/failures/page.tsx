import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { FailureCard } from "@/components/execution/failure-card";
import { RecoveryStatusCards } from "@/components/execution/recovery-status-card";
import { failures, type FailureClass } from "@/features/execution/mock";
import { failureClassLabel } from "@/components/execution/execution-tokens";

export default function FailuresPage() {
  const classes: FailureClass[] = ["infrastructure", "application", "business", "reasoning", "human"];
  const countByClass = (c: FailureClass) => failures.filter((f) => f.classification === c).length;

  return (
    <>
      <PageHeader
        title="Failures"
        context="Failed executions, classification, root cause and recovery strategy."
        action={<Badge variant="error">{failures.length} failures</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        {classes.map((c) => (
          <div key={c} className="col-span-6 sm:col-span-4 xl:col-span-2">
            <StatCard label={failureClassLabel[c]} value={`${countByClass(c)}`} />
          </div>
        ))}
        <div className="col-span-6 sm:col-span-4 xl:col-span-2">
          <StatCard label="Total" value={`${failures.length}`} />
        </div>

        <div className="col-span-12">
          <h3 className="mb-1 text-sm font-semibold text-fg">Failure Records</h3>
        </div>
        {failures.map((f) => (
          <div key={f.id} className="col-span-12 sm:col-span-6 xl:col-span-4">
            <FailureCard failure={f} />
          </div>
        ))}

        <div className="col-span-12">
          <h3 className="mb-1 text-sm font-semibold text-fg">Recovery Status</h3>
        </div>
        <RecoveryStatusCards />
      </div>
    </>
  );
}
