import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { ExecutionTable } from "@/components/director/execution-table";
import { executions, executionStatusCounts } from "@/features/director/mock";

export default function ActiveExecutionsPage() {
  const c = executionStatusCounts;
  const tiles = [
    { label: "Running", value: c.running },
    { label: "Waiting", value: c.waiting },
    { label: "Retrying", value: c.retrying },
    { label: "Blocked", value: c.blocked },
    { label: "Completed", value: c.completed },
    { label: "Failed", value: c.failed },
  ];

  return (
    <>
      <PageHeader
        title="Active Executions"
        context="Live execution runs across the platform — status, owner and graph progress."
        action={<Badge variant="primary">{executions.length} runs</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        {tiles.map((t) => (
          <div key={t.label} className="col-span-6 sm:col-span-4 xl:col-span-2">
            <StatCard label={t.label} value={`${t.value}`} />
          </div>
        ))}

        <div className="col-span-12">
          <ExecutionTable runs={executions} />
        </div>
      </div>
    </>
  );
}
