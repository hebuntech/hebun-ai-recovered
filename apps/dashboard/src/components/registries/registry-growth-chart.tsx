import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RegistryGrowthPoint } from "@/features/registries/types";

export function RegistryGrowthChart({
  title = "Registry Growth",
  points,
}: {
  title?: string;
  points: RegistryGrowthPoint[];
}) {
  const max = Math.max(...points.map((point) => point.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <span className="text-xs text-fg-muted">7-day record trend</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {points.map((point) => (
          <div key={point.day} className="grid grid-cols-[48px_1fr_64px] items-center gap-3">
            <span className="text-xs font-medium text-fg-secondary">{point.day}</span>
            <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(point.value / max) * 100}%` }}
              />
            </div>
            <span className="text-right text-xs font-medium tabular-nums text-fg">
              {point.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
