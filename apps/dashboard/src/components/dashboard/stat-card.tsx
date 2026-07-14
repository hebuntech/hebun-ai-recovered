import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaDirection?: "up" | "down";
  caption?: string;
  icon?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  delta,
  deltaDirection = "up",
  caption,
  icon,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex min-h-36 flex-col gap-3">
        <div className="flex min-h-9 items-start justify-between gap-3">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-fg-secondary">
            {label}
          </span>
          {icon && <span className="shrink-0 text-fg-muted">{icon}</span>}
        </div>
        <span className="text-3xl font-semibold leading-none tabular-nums text-fg sm:text-[2rem]">
          {value}
        </span>
        {(delta || caption) && (
          <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            {delta && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-medium tabular-nums",
                  deltaDirection === "up" ? "text-success" : "text-error"
                )}
              >
                {deltaDirection === "up" ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {delta}
              </span>
            )}
            {caption && <span className="leading-5 text-fg-muted">{caption}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
