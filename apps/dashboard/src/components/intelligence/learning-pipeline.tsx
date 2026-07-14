import { ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { coreTheme } from "@/components/architecture/core-theme";
import { learningPipeline } from "@/features/intelligence/mock";

export function LearningPipeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Pipeline</CardTitle>
        <span className="text-xs text-fg-muted">execution → improvement</span>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col">
          {learningPipeline.map((step, i) => {
            const theme = coreTheme[step.kind];
            return (
              <li key={step.id} className="flex flex-col">
                <div className={cn("flex items-center gap-3 rounded-md border bg-surface p-3", theme.border)}>
                  <span className={cn("size-2.5 shrink-0 rounded-full", theme.dot)} />
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-fg">{step.label}</span>
                    <span className="truncate text-xs text-fg-muted">{step.detail}</span>
                  </div>
                </div>
                {i < learningPipeline.length - 1 && (
                  <span className="flex h-5 items-center justify-center text-fg-muted">
                    <ArrowDown className="size-4" />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
