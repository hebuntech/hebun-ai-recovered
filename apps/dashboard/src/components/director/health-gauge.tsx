import { cn } from "@/lib/utils";

interface HealthGaugeProps {
  value: number; // 0–100
  label?: string;
  size?: number; // px diameter
}

function toneFor(value: number): string {
  if (value >= 90) return "text-success";
  if (value >= 75) return "text-info";
  if (value >= 60) return "text-warning";
  return "text-error";
}

/*
 * Circular health gauge. Ring color resolves from design tokens via
 * currentColor (text-success/info/warning/error) — no hardcoded hex.
 */
export function HealthGauge({ value, label, size = 132 }: HealthGaugeProps) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c - (pct / 100) * c;
  const tone = toneFor(pct);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            className="text-border"
            stroke="currentColor"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className={cn("transition-[stroke-dashoffset] duration-(--dur-slow)", tone)}
            stroke="currentColor"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-bold tabular-nums", tone)}>{pct}</span>
          <span className="text-xs text-fg-muted">/ 100</span>
        </div>
      </div>
      {label && <span className="text-sm font-medium text-fg-secondary">{label}</span>}
    </div>
  );
}
