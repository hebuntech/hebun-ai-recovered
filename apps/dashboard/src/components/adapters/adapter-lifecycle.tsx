import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { lifecycleStages, adapterRecords } from "@/features/adapters";

export function AdapterLifecycle() {
  const current = adapterRecords[0]?.lifecycle ?? "Ready";
  const currentIndex = lifecycleStages.indexOf(current);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Adapter Lifecycle</CardTitle>
        <span className="text-xs text-fg-muted">Simulation Adapter · {current}</span>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">
        {lifecycleStages.map((stage, i) => {
          const reached = i <= currentIndex;
          const active = i === currentIndex;
          return (
            <div key={stage} className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium",
                  active && "border-primary/40 bg-primary/12 text-primary",
                  reached && !active && "border-success/40 bg-success/12 text-success",
                  !reached && "text-fg-muted"
                )}
              >
                {stage}
              </span>
              {i < lifecycleStages.length - 1 && <ArrowRight className="size-3.5 text-fg-muted" />}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
