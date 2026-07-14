import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { AlertFeed } from "@/components/director/alert-feed";
import { criticalAlerts } from "@/features/director/mock";

export default function CriticalAlertsPage() {
  const critical = criticalAlerts.filter((a) => a.escalation === "critical").length;
  const elevated = criticalAlerts.filter((a) => a.escalation === "elevated").length;
  const monitor = criticalAlerts.filter((a) => a.escalation === "monitor").length;

  return (
    <>
      <PageHeader
        title="Critical Alerts"
        context="Incidents, risk, compliance, infra, approval and security — with escalation level."
        action={<Badge variant="error">{critical} critical</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 sm:col-span-4">
          <StatCard label="Critical" value={`${critical}`} caption="act now" />
        </div>
        <div className="col-span-12 sm:col-span-4">
          <StatCard label="Elevated" value={`${elevated}`} caption="watch closely" />
        </div>
        <div className="col-span-12 sm:col-span-4">
          <StatCard label="Monitor" value={`${monitor}`} caption="informational" />
        </div>

        <div className="col-span-12 xl:col-span-8">
          <AlertFeed alerts={criticalAlerts} title="All Alerts" />
        </div>
      </div>
    </>
  );
}
