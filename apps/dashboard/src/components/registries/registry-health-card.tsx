import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RegistryDefinition } from "@/features/registries/types";

export function RegistryHealthCard({ registry }: { registry: RegistryDefinition }) {
  const variant = registry.status === "healthy" ? "success" : registry.status === "attention" ? "warning" : "error";
  const metrics = [
    ["Health", registry.health],
    ["Synchronization", registry.synchronization],
    ["Consistency", registry.consistency],
    ["Validation", registry.validation],
    ["Coverage", registry.coverage],
  ] as const;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{registry.title}</CardTitle>
        <Badge variant={variant}>{registry.status}</Badge>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-md border bg-surface-sunken p-3">
            <p className="text-xs uppercase tracking-wider text-fg-muted">{label}</p>
            <p className="mt-1 font-semibold tabular-nums">{value}%</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
