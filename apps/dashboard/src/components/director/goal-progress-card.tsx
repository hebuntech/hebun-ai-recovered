import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/director/progress-bar";
import { priorityVariant, goalStatusVariant, riskVariant } from "@/components/director/director-tokens";
import type { StrategicGoal } from "@/features/director/mock";

const statusLabel: Record<StrategicGoal["status"], string> = {
  "on-track": "On track",
  "at-risk": "At risk",
  blocked: "Blocked",
  achieved: "Achieved",
};

export function GoalProgressCard({ goal }: { goal: StrategicGoal }) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-fg">{goal.title}</h3>
          <Badge variant={goalStatusVariant[goal.status]}>{statusLabel[goal.status]}</Badge>
        </div>

        <p className="text-xs text-fg-secondary">{goal.businessImpact}</p>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-fg-muted">Progress</span>
            <span className="font-medium tabular-nums text-fg-secondary">{goal.progress}%</span>
          </div>
          <ProgressBar value={goal.progress} />
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 border-t pt-3 text-xs">
          <Badge variant={priorityVariant[goal.priority]}>{goal.priority}</Badge>
          <Badge variant={riskVariant[goal.risk]}>risk: {goal.risk}</Badge>
          <span className="text-fg-muted">{goal.owner}</span>
          <span className="ml-auto text-fg-muted tabular-nums">{goal.timeline}</span>
        </div>
      </CardContent>
    </Card>
  );
}
