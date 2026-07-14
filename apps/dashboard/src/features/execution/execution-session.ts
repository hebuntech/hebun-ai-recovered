import type { CoreRiskLevel } from "@/features/shared";
import type { OrchestrationBlueprint } from "@/features/orchestration";
import { allocateExecutors, dispatchExecutionAssignments } from "@/features/execution/execution-dispatcher";
import { buildExecutionEvents } from "@/features/execution/execution-events";
import { monitorExecutionSession, buildExecutionProgress } from "@/features/execution/execution-monitor";
import { buildExecutionSummary } from "@/features/execution/execution-summary";
import { buildExecutionTelemetry } from "@/features/execution/execution-telemetry";
import { validateExecutionReadiness } from "@/features/execution/execution-validator";
import { determineRetryCount } from "@/features/execution/retry-engine";
import { determineRollbackCount } from "@/features/execution/rollback-engine";
import type { ExecutionSession } from "@/features/execution/types";

function sessionState(
  blueprint: OrchestrationBlueprint,
  index: number
): ExecutionSession["executionState"] {
  if (!blueprint.validationResult.valid) {
    return index % 2 === 0 ? "failed" : "blocked";
  }

  const mapped: ExecutionSession["executionState"][] = [
    "running",
    "queued",
    "completed",
    "retrying",
    "waiting",
  ];

  return mapped[index % mapped.length] ?? "ready";
}

function sessionTimestamps(
  blueprint: OrchestrationBlueprint,
  state: ExecutionSession["executionState"]
) {
  const startedAt = blueprint.createdAt;
  const endedAt =
    state === "completed" ||
    state === "failed" ||
    state === "cancelled" ||
    state === "rolled-back" ||
    state === "timed-out"
      ? blueprint.updatedAt
      : undefined;

  return { startedAt, endedAt };
}

function highestRisk(blueprint: OrchestrationBlueprint): CoreRiskLevel {
  if (blueprint.riskAssessment.some((risk) => risk.level === "critical")) return "critical";
  if (blueprint.riskAssessment.some((risk) => risk.level === "high")) return "high";
  if (blueprint.riskAssessment.some((risk) => risk.level === "medium")) return "medium";
  return "low";
}

export function createExecutionSession(
  blueprint: OrchestrationBlueprint,
  index: number
): ExecutionSession {
  const executionState = sessionState(blueprint, index);
  const readiness = validateExecutionReadiness(blueprint);
  const { startedAt, endedAt } = sessionTimestamps(blueprint, executionState);
  const executors = allocateExecutors(blueprint);
  const executorAssignments = dispatchExecutionAssignments(
    blueprint,
    executionState,
    startedAt
  );
  const taskIds = blueprint.plan.tasks.map((task) => task.id);
  const { completedTasks, failedTasks, progress } = buildExecutionProgress(
    taskIds,
    executionState
  );
  const retryCount = determineRetryCount(blueprint, executionState);
  const rollbackCount = determineRollbackCount(blueprint, executionState);

  const baseSession: ExecutionSession = {
    id: `exec-${blueprint.id}`,
    orchestrationId: blueprint.id,
    planId: blueprint.planId,
    reasoningId: blueprint.plan.reasoningId,
    governanceId: blueprint.plan.governanceDecisionId,
    status: executionState,
    startedAt,
    endedAt,
    executionState,
    readiness,
    executors,
    executorAssignments,
    progress,
    completedTasks,
    failedTasks,
    retryCount,
    rollbackCount,
    telemetry: {
      executionDuration: "0m",
      executionDurationMinutes: 0,
      queueTime: "0m",
      retryCount: 0,
      failureCount: 0,
      rollbackCount: 0,
      cancellationCount: 0,
      successRate: 0,
      completionRate: 0,
      averageTaskTime: "0m",
    },
    events: [],
    summary: {
      headline: "",
      outcome: "",
      nextStep: "",
      explanation: "",
    },
    confidence: Math.max(
      55,
      Math.min(97, blueprint.confidence - readiness.blockers.length * 7 - retryCount * 3)
    ),
    riskLevel: highestRisk(blueprint),
    relatedRegistryIds: blueprint.relatedRegistryIds,
    relatedGraphNodeIds: blueprint.relatedGraphNodeIds,
    relatedMemoryIds: blueprint.relatedMemoryIds,
    relatedReasoningIds: blueprint.relatedReasoningIds,
    relatedGovernanceIds: blueprint.relatedGovernanceIds,
    relatedPlanningIds: blueprint.relatedPlanningIds,
    relatedOrchestrationIds: [blueprint.id],
    createdAt: blueprint.createdAt,
    updatedAt: endedAt ?? blueprint.updatedAt,
    orchestration: blueprint,
  };

  const telemetry = buildExecutionTelemetry(baseSession);
  const sessionWithTelemetry = { ...baseSession, telemetry };
  const events = buildExecutionEvents(sessionWithTelemetry);
  const summary = buildExecutionSummary(sessionWithTelemetry);

  return {
    ...sessionWithTelemetry,
    events,
    summary,
  };
}

export function sessionMonitorSummary(session: ExecutionSession) {
  return monitorExecutionSession(session);
}
