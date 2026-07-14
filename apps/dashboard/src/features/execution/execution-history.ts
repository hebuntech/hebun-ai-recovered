import type { ExecutionHistoryRecord } from "@/features/execution/types";
import { executionSessions } from "@/features/execution/execution-pipeline";
import { executionStateLabels } from "@/features/execution/execution-state";

export const executionHistory: ExecutionHistoryRecord[] = executionSessions.map(
  (session) => ({
    id: session.id,
    title: session.orchestration.plan.title,
    state: session.executionState,
    owner: session.orchestration.plan.owner,
    progressLabel: `${session.progress.completedTasks}/${session.progress.totalTasks} tasks`,
    outcome: `${executionStateLabels[session.executionState]} · ${session.summary.outcome}`,
    timestamp: session.endedAt ?? session.startedAt,
  })
);
