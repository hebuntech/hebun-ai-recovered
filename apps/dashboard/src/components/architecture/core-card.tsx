import Link from "next/link";
import { ArrowRight, Brain, Zap, Lightbulb, ShieldCheck, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { coreTheme } from "@/components/architecture/core-theme";
import type { CoreDefinition, CoreId } from "@/features/architecture/mock";

const coreIcon: Record<CoreId, LucideIcon> = {
  cognitive: Brain,
  execution: Zap,
  intelligence: Lightbulb,
  governance: ShieldCheck,
};

export function CoreCard({ core }: { core: CoreDefinition }) {
  const theme = coreTheme[core.id];
  const Icon = coreIcon[core.id];

  return (
    <Link href={core.href} className="group block h-full">
      <Card className={cn("h-full transition-colors duration-(--dur-fast)", "hover:border-border-strong")}>
        <CardContent className="flex h-full flex-col gap-4">
          <div className="flex items-start justify-between">
            <span className={cn("flex size-11 items-center justify-center rounded-lg", theme.bg, theme.text)}>
              <Icon className="size-5" />
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
              <span className={cn("size-2 rounded-full", theme.dot)} />
              {core.health}%
            </span>
          </div>

          <div>
            <h3 className="text-base font-semibold text-fg">{core.name}</h3>
            <p className={cn("mt-0.5 text-xs font-medium", theme.text)}>{core.tagline}</p>
          </div>

          <p className="text-sm text-fg-secondary">{core.question}</p>

          <div className="mt-auto flex items-center justify-between border-t pt-3 text-xs text-fg-muted">
            <span className="tabular-nums">
              {core.engineCount} engines · {core.registryCount} reg · {core.adr}
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-fg-secondary transition-colors group-hover:text-fg">
              Open
              <ArrowRight className="size-3.5 transition-transform duration-(--dur-fast) group-hover:translate-x-0.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
