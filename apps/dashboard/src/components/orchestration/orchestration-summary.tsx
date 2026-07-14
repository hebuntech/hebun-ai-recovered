import { Boxes, Bot, GitBranch, ShieldAlert, ShieldCheck, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { orchestrationMetrics } from "@/features/orchestration";

export function OrchestrationSummary() {
  return (
    <>
      <div className="col-span-12 sm:col-span-6 xl:col-span-2">
        <StatCard label="Active Blueprints" value={`${orchestrationMetrics.activeBlueprints}`} icon={<Boxes className="size-4" />} />
      </div>
      <div className="col-span-12 sm:col-span-6 xl:col-span-2">
        <StatCard label="Agent Assignments" value={`${orchestrationMetrics.agentAssignments}`} icon={<Bot className="size-4" />} />
      </div>
      <div className="col-span-12 sm:col-span-6 xl:col-span-2">
        <StatCard label="Human Handoffs" value={`${orchestrationMetrics.humanHandoffs}`} icon={<Users className="size-4" />} />
      </div>
      <div className="col-span-12 sm:col-span-6 xl:col-span-2">
        <StatCard label="Blocked Assignments" value={`${orchestrationMetrics.blockedAssignments}`} icon={<ShieldAlert className="size-4" />} />
      </div>
      <div className="col-span-12 sm:col-span-6 xl:col-span-2">
        <StatCard label="Fallback Coverage" value={`${orchestrationMetrics.fallbackCoverage}%`} icon={<GitBranch className="size-4" />} />
      </div>
      <div className="col-span-12 sm:col-span-6 xl:col-span-2">
        <StatCard label="Orchestration Health" value={`${orchestrationMetrics.orchestrationHealth}`} icon={<ShieldCheck className="size-4" />} />
      </div>
    </>
  );
}
