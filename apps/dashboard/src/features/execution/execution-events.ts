import type {
  ExecutionEvent,
  ExecutionEventType,
  ExecutionSession,
} from "@/features/execution/types";

function pushEvent(
  events: ExecutionEvent[],
  session: ExecutionSession,
  index: number,
  type: ExecutionEventType,
  summary: string,
  taskId?: string,
  owner?: string
) {
  events.push({
    id: `${session.id}-event-${index + 1}`,
    type,
    timestamp: index === 0 ? session.createdAt : taskId ? session.startedAt : session.updatedAt,
    summary,
    taskId,
    owner,
  });
}

export function buildExecutionEvents(
  session: ExecutionSession
): ExecutionEvent[] {
  const events: ExecutionEvent[] = [];
  pushEvent(
    events,
    session,
    events.length,
    "Execution Created",
    `Execution session created from orchestration blueprint ${session.orchestrationId}.`
  );

  if (session.executionState !== "pending" && session.executionState !== "queued") {
    pushEvent(
      events,
      session,
      events.length,
      "Execution Started",
      `Execution monitoring started for plan ${session.planId}.`
    );
  }

  session.executorAssignments.slice(0, 3).forEach((assignment) => {
    pushEvent(
      events,
      session,
      events.length,
      "Task Assigned",
      `${assignment.taskTitle} assigned to ${assignment.owner}.`,
      assignment.taskId,
      assignment.owner
    );
  });

  const runningAssignment = session.executorAssignments.find(
    (assignment) => assignment.status === "running"
  );
  if (runningAssignment) {
    pushEvent(
      events,
      session,
      events.length,
      "Task Started",
      `${runningAssignment.taskTitle} entered active execution.`,
      runningAssignment.taskId,
      runningAssignment.owner
    );
  }

  session.completedTasks.slice(0, 2).forEach((taskId) => {
    pushEvent(
      events,
      session,
      events.length,
      "Task Completed",
      `${taskId} completed inside the deterministic runtime.`,
      taskId
    );
  });

  session.failedTasks.slice(0, 1).forEach((taskId) => {
    pushEvent(
      events,
      session,
      events.length,
      "Task Failed",
      `${taskId} failed and was retained for explainable recovery.`,
      taskId
    );
  });

  if (session.retryCount > 0) {
    pushEvent(
      events,
      session,
      events.length,
      "Retry Started",
      `${session.retryCount} retry path(s) were activated for bounded recovery.`
    );
  }

  if (session.rollbackCount > 0) {
    pushEvent(
      events,
      session,
      events.length,
      "Rollback Started",
      `${session.rollbackCount} rollback checkpoint(s) were reserved or triggered.`
    );
  }

  if (session.executionState === "cancelled") {
    pushEvent(
      events,
      session,
      events.length,
      "Execution Cancelled",
      "Execution was cancelled before completion."
    );
  }

  if (session.executionState === "completed") {
    pushEvent(
      events,
      session,
      events.length,
      "Execution Completed",
      "Execution completed with a full summary and telemetry output."
    );
  }

  if (session.executionState === "failed") {
    pushEvent(
      events,
      session,
      events.length,
      "Execution Failed",
      "Execution ended in failure after bounded recovery logic."
    );
  }

  if (session.executionState === "timed-out") {
    pushEvent(
      events,
      session,
      events.length,
      "Execution Timed Out",
      "Execution exceeded its time window and was closed deterministically."
    );
  }

  return events;
}
