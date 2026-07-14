import { StatCard } from "@/components/dashboard/stat-card";
import type { RegistryDefinition } from "@/features/registries/types";

export function RegistryMetrics({ registry }: { registry: RegistryDefinition }) {
  return (
    <>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Record Count" value={`${registry.totalRecords}`} />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Active Records" value={`${registry.activeRecords}`} />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Archived Records" value={`${registry.archivedRecords}`} />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Growth Trend" value={`+${registry.dailyGrowth}/day`} />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Recent Changes" value={`${registry.recentChanges}`} />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Health Score" value={`${registry.health}`} />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Synchronization" value={`${registry.synchronization}%`} />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Coverage" value={`${registry.coverage}%`} />
      </div>
    </>
  );
}
