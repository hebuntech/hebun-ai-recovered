import { StatCard } from "@/components/dashboard/stat-card";
import { registryOverviewMetrics } from "@/features/registries";

export function RegistrySummary() {
  return (
    <>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Total Registries" value={`${registryOverviewMetrics.totalRegistries}`} />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Registry Health" value={`${registryOverviewMetrics.registryHealth}`} caption="composite" />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Total Records" value={`${registryOverviewMetrics.totalRecords}`} />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Daily Growth" value={`+${registryOverviewMetrics.dailyGrowth}`} />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Active Records" value={`${registryOverviewMetrics.activeRecords}`} />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Archived Records" value={`${registryOverviewMetrics.archivedRecords}`} />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Synchronization" value={`${registryOverviewMetrics.synchronization}%`} />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Recent Changes" value={`${registryOverviewMetrics.recentChanges}`} />
      </div>
    </>
  );
}
