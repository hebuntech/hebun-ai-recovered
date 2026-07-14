import { AlertTriangle, Info, ShieldAlert, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardSignal } from "@/features/director-dashboard/foundation";

const severityConfig = {
  critical: {
    icon: ShieldAlert,
    tone: "text-error",
    chip: "bg-error-subtle text-error",
    label: "Critical",
  },
  high: {
    icon: AlertTriangle,
    tone: "text-warning",
    chip: "bg-warning-subtle text-warning",
    label: "High",
  },
  medium: {
    icon: TrendingUp,
    tone: "text-info",
    chip: "bg-info-subtle text-info",
    label: "Medium",
  },
  low: {
    icon: Info,
    tone: "text-fg-secondary",
    chip: "bg-surface-sunken text-fg-secondary",
    label: "Low",
  },
} as const;

interface SignalListProps {
  items: DashboardSignal[];
}

export function SignalList({ items }: SignalListProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const config = severityConfig[item.severity];
        const Icon = config.icon;

        return (
          <div
            key={item.id}
            className="flex gap-3 rounded-xl border border-border bg-surface-sunken p-4"
          >
            <div className={cn("mt-0.5 shrink-0", config.tone)}>
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium leading-6 text-fg">{item.title}</p>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em]",
                    config.chip,
                  )}
                >
                  {config.label}
                </span>
              </div>
              <p className="text-sm leading-6 text-fg-secondary">{item.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
