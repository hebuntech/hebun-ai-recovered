import { RotateCcw, Cpu, Wrench, Undo2, UserCog, CircuitBoard, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { recoveryLabel } from "@/components/execution/execution-tokens";
import { recoveryStatuses, type RecoveryKind } from "@/features/execution/mock";

const recoveryIcon: Record<RecoveryKind, LucideIcon> = {
  retry: RotateCcw,
  "fallback-model": Cpu,
  "alternative-tool": Wrench,
  compensation: Undo2,
  "human-escalation": UserCog,
  "circuit-breaker": CircuitBoard,
};

export function RecoveryStatusCards() {
  return (
    <>
      {recoveryStatuses.map((r) => {
        const Icon = recoveryIcon[r.kind];
        return (
          <div key={r.kind} className="col-span-6 sm:col-span-4 xl:col-span-2">
            <Card className="h-full">
              <CardContent className="flex flex-col gap-2">
                <span className="flex size-8 items-center justify-center rounded-md bg-primary-subtle text-primary">
                  <Icon className="size-4" />
                </span>
                <span className="text-sm font-semibold text-fg">{recoveryLabel[r.kind]}</span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-success">{r.active} active</span>
                  <span className="text-fg-muted">{r.succeeded} ok</span>
                  {r.failed > 0 && <span className="text-error">{r.failed} fail</span>}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </>
  );
}
