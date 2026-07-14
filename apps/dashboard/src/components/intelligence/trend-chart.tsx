import { cn } from "@/lib/utils";

/*
 * Minimal sparkline bar chart. Color resolves from design tokens via
 * currentColor (pass a text-* token class). No hardcoded hex.
 */
export function TrendChart({ series, className, height = 40 }: { series: number[]; className?: string; height?: number }) {
  const max = Math.max(...series, 1);
  const barW = 100 / (series.length * 1.5);
  const gap = barW / 2;

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      className={cn("w-full", className)}
      style={{ height }}
      role="img"
      aria-label="trend"
    >
      {series.map((v, i) => {
        const h = (v / max) * (height - 4);
        const x = i * (barW + gap);
        return (
          <rect
            key={i}
            x={x}
            y={height - h}
            width={barW}
            height={h}
            rx="1"
            fill="currentColor"
            opacity={0.35 + (0.65 * (i + 1)) / series.length}
          />
        );
      })}
    </svg>
  );
}
