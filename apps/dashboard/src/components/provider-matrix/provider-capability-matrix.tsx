import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { capabilityMatrix } from "@/features/provider-matrix";
import type { CapabilitySupport } from "@/features/provider-matrix";
import { cn } from "@/lib/utils";

const cellClass: Record<CapabilitySupport, string> = {
  primary: "bg-success-subtle text-success",
  secondary: "bg-info-subtle text-info",
  unsupported: "bg-surface-sunken text-fg-muted",
};

const cellMark: Record<CapabilitySupport, string> = {
  primary: "P",
  secondary: "S",
  unsupported: "·",
};

export function ProviderCapabilityMatrix() {
  const { capabilities, rows } = capabilityMatrix;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Capability Matrix</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">
          {rows.length} providers × {capabilities.length} capabilities
        </span>
      </CardHeader>
      <CardContent className="ui-table-wrap">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 bg-surface p-2 text-left font-semibold text-fg-secondary">
                Provider
              </th>
              {capabilities.map((c) => (
                <th
                  key={c}
                  className="p-2 text-center align-bottom font-medium text-fg-secondary"
                >
                  <span className="inline-block whitespace-nowrap [writing-mode:vertical-rl] [transform:rotate(180deg)]">
                    {c}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.providerId} className="border-t">
                <td className="sticky left-0 bg-surface p-2 font-medium text-fg whitespace-nowrap">
                  {row.name}
                </td>
                {row.cells.map((cell) => (
                  <td key={cell.capability} className="p-1 text-center">
                    <span
                      className={cn(
                        "inline-flex size-6 items-center justify-center rounded-sm font-bold tabular-nums",
                        cellClass[cell.support]
                      )}
                      title={`${row.name} — ${cell.capability}: ${cell.support}`}
                    >
                      {cellMark[cell.support]}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-fg-secondary">
          <span className="flex items-center gap-1.5">
            <span className={cn("inline-flex size-5 items-center justify-center rounded-sm font-bold", cellClass.primary)}>P</span>
            Primary
          </span>
          <span className="flex items-center gap-1.5">
            <span className={cn("inline-flex size-5 items-center justify-center rounded-sm font-bold", cellClass.secondary)}>S</span>
            Secondary
          </span>
          <span className="flex items-center gap-1.5">
            <span className={cn("inline-flex size-5 items-center justify-center rounded-sm font-bold", cellClass.unsupported)}>·</span>
            Unsupported
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
