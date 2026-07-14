import { ClipboardList, Flag, Layers3, ShieldAlert, TimerReset, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { planningMetrics } from "@/features/planning";

export function PlanningSummary() {
  return (
    <>
      <div className="col-span-12 sm:col-span-6 xl:col-span-2">
        <StatCard label="Active Plans" value={`${planningMetrics.activePlans}`} icon={<ClipboardList className="size-4" />} />
      </div>
      <div className="col-span-12 sm:col-span-6 xl:col-span-2">
        <StatCard label="Tasks Generated" value={`${planningMetrics.tasksGenerated}`} icon={<Layers3 className="size-4" />} />
      </div>
      <div className="col-span-12 sm:col-span-6 xl:col-span-2">
        <StatCard label="Milestones" value={`${planningMetrics.milestones}`} icon={<Flag className="size-4" />} />
      </div>
      <div className="col-span-12 sm:col-span-6 xl:col-span-2">
        <StatCard label="Blocked Plans" value={`${planningMetrics.blockedPlans}`} icon={<ShieldAlert className="size-4" />} />
      </div>
      <div className="col-span-12 sm:col-span-6 xl:col-span-2">
        <StatCard label="Avg Estimate" value={planningMetrics.averageCompletionEstimate} icon={<TimerReset className="size-4" />} />
      </div>
      <div className="col-span-12 sm:col-span-6 xl:col-span-2">
        <StatCard label="Planning Health" value={`${planningMetrics.planningHealth}`} icon={<TrendingUp className="size-4" />} />
      </div>
    </>
  );
}
