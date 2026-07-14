import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { PermissionMatrix } from "@/components/governance/permission-matrix";
import {
  permissionRoles,
  permissionChanges,
  permissionConflicts,
  highPrivilegeAccounts,
} from "@/features/governance/permissions";
import { EventTimeline } from "@/components/dashboard/event-timeline";

export default function GovernancePermissionsPage() {
  return (
    <>
      <PageHeader
        title="Permission Center"
        context="Roles, access rights, recent changes, conflicts and high privilege accounts."
        action={<Badge variant="warning">{permissionConflicts.length} conflicts</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-6 sm:col-span-3"><StatCard label="Roles" value={`${permissionRoles.length}`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="High Privilege" value={`${highPrivilegeAccounts.length}`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Changes" value={`${permissionChanges.length}`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Conflicts" value={`${permissionConflicts.length}`} /></div>

        <div className="col-span-12">
          <PermissionMatrix />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <EventTimeline
            events={permissionChanges.map((change) => ({
              id: change.id,
              type: "permission.change",
              source: change.actor,
              message: change.change,
              severity: "info",
              timestamp: change.when,
            }))}
            title="Recent Permission Changes"
          />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <EventTimeline
            events={permissionConflicts.map((conflict) => ({
              id: conflict.id,
              type: "permission.conflict",
              source: "Permission Control",
              message: conflict.detail,
              severity: conflict.severity,
              timestamp: conflict.title,
            }))}
            title="Permission Conflicts"
          />
        </div>
      </div>
    </>
  );
}
