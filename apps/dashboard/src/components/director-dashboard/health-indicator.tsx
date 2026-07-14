import { cn } from "@/lib/utils";

interface HealthIndicatorProps {
  score: number;
}

export function HealthIndicator({ score }: HealthIndicatorProps) {
  const tone =
    score >= 90
      ? "bg-success"
      : score >= 75
        ? "bg-warning"
        : "bg-error";

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-surface-sunken">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-medium tabular-nums text-fg">{score}%</span>
    </div>
  );
}
