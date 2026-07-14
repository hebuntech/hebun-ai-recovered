import { cn } from "@/lib/utils";
import { progressTone } from "@/components/director/director-tokens";

export function ProgressBar({ value, tone }: { value: number; tone?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
      <div
        className={cn("h-full rounded-full transition-[width] duration-(--dur-slow)", tone ?? progressTone(pct))}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
