import { StatCard } from "@/components/dashboard/stat-card";
import { HeartPulse, Building2, Bot, Play, Clock, Siren, Gauge, Cpu } from "lucide-react";
import { organizationSummary as s } from "@/features/organization/mock";

export function OrganizationSummary() {
  const tiles = [
    { label: "Organization Health", value: `${s.health}`, caption: "composite", icon: <HeartPulse className="size-4" /> },
    { label: "Departments Online", value: `${s.departmentsOnline}/${s.departmentsTotal}`, caption: "operational units", icon: <Building2 className="size-4" /> },
    { label: "Active Agents", value: `${s.activeAgents}/${s.totalAgents}`, caption: "running now", icon: <Bot className="size-4" /> },
    { label: "Running Executions", value: `${s.runningExecutions}`, caption: "in flight", icon: <Play className="size-4" /> },
    { label: "Waiting Executions", value: `${s.waitingExecutions}`, caption: "queued/blocked", icon: <Clock className="size-4" /> },
    { label: "Critical Alerts", value: `${s.criticalAlerts}`, caption: "act now", icon: <Siren className="size-4" /> },
    { label: "Avg Capacity", value: `${s.avgCapacity}%`, caption: "utilization", icon: <Gauge className="size-4" /> },
    { label: "AI Utilization", value: `${s.aiUtilization}%`, caption: "across org", icon: <Cpu className="size-4" /> },
  ];
  return (
    <>
      {tiles.map((t) => (
        <div key={t.label} className="col-span-6 sm:col-span-4 xl:col-span-3">
          <StatCard label={t.label} value={t.value} caption={t.caption} icon={t.icon} />
        </div>
      ))}
    </>
  );
}
