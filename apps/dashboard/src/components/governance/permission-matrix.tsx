import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { accessTone } from "@/components/governance/governance-tokens";
import { cn } from "@/lib/utils";
import { permissionMatrix } from "@/features/governance/permissions";

export function PermissionMatrix() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission Matrix</CardTitle>
        <span className="text-xs text-fg-muted">department access by capability</span>
      </CardHeader>
      <CardContent className="ui-table-wrap">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Capability", "Finance", "HR", "Legal", "Operations", "Director"].map((head) => (
                <th key={head} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-fg-secondary">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissionMatrix.map((row) => (
              <tr key={row.capability} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3 font-medium text-fg">{row.capability}</td>
                {([row.finance, row.hr, row.legal, row.operations, row.director] as const).map((access, i) => (
                  <td key={`${row.capability}-${i}`} className={cn("px-4 py-3 capitalize", accessTone(access))}>
                    {access}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
