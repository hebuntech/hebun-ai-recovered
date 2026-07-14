import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  registryTypeLabel,
  type RegistryDefinition,
  type RegistryType,
} from "@/features/architecture/mock";

const typeAccent: Record<RegistryType, string> = {
  definition: "text-info",
  state: "text-accent",
  learning: "text-highlight",
  governance: "text-success",
};

export function RegistryTable({ registries }: { registries: RegistryDefinition[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registries</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{registries.length} total</span>
      </CardHeader>
      <CardContent className="p-0">
        <div className="ui-table-wrap">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-fg-muted">
                <th className="px-6 py-3 font-medium">Registry</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Records</th>
                <th className="px-6 py-3 font-medium">Owner</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Last update</th>
              </tr>
            </thead>
            <tbody>
              {registries.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="px-6 py-3 font-medium text-fg">{r.name}</td>
                  <td className={cn("px-6 py-3 font-medium", typeAccent[r.type])}>
                    {registryTypeLabel[r.type]}
                  </td>
                  <td className="px-6 py-3 tabular-nums text-fg-secondary">
                    {r.records.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-fg-secondary">{r.owner}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                      <span className="size-1.5 rounded-full bg-success" />
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-3 text-fg-muted tabular-nums">{r.lastUpdate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
