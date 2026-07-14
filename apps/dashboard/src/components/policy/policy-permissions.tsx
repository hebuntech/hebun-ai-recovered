import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GovernanceResult } from "@/features/policy";

export function PolicyPermissions({ result }: { result: GovernanceResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission Evaluation</CardTitle>
        <span className="text-xs text-fg-muted">
          role-based authorization before planning can proceed
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {result.permissionResults.map((permission) => (
          <div key={permission.role} className="rounded-md border bg-surface-sunken p-4">
            <p className="text-sm font-semibold text-fg">{permission.role}</p>
            <p className="mt-1 text-sm text-fg-secondary">{permission.detail}</p>
            <p className="mt-2 text-xs text-fg-muted">
              {permission.status} · {permission.allowedActions.length} allowed · {permission.blockedActions.length} blocked
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
