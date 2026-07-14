import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/director/progress-bar";
import { capacity } from "@/features/director/mock";

export function CapacityPanel({ title = "Platform Capacity" }: { title?: string }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {capacity.map((m) => (
          <div key={m.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-fg-secondary">{m.label}</span>
              <span className="font-medium tabular-nums text-fg">{m.value}%</span>
            </div>
            <ProgressBar value={m.value} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
