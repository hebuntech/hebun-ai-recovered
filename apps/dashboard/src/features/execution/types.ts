import type { BadgeVariant } from "@/components/ui/badge";
import type { OrchestrationBlueprint } from "@/features/orchestration";
import type {
  CoreRiskLevel,
  DownstreamReferenceIds,
  PipelineRecordTimestamps,
} from "@/features/shared";

export type ExecutionState =
  | "pending"
  | "queued"
  | "ready"
  | "running"
  | "waiting"
  | "blocked"
  | "retrying"
  | "paused"
  | "completed"
  | "cancelled"
  | "rolled-back"
  | "failed"
  | "timed-out";

export type ExecutorType =
  | "Executor"
  | "AgentExecutor"
  | "HumanExecutor"
  | "ExternalExecutor"
  | "SimulationExecutor";

export type ExecutionEventType =
  | "Execution Created"
  | "Execution Started"
  | "Task Assigned"
  | "Task Started"
  | "Task Completed"
  | "Task Failed"
  | "Retry Started"
  | "Rollback Started"
  | "Execution Cancelled"
  | "Execution Completed"
  | "Execution Failed"
  | "Execution Timed Out";

export interface ExecutionPipelineStep {
  id: string;
  label: string;
  description: string;
}

export interface ExecutionReadiness {
  ready: boolean;
  blockers: string[];
  warnings: string[];
  summary: string;
}

export interface AbstractExecutor {
  id: string;
  title: string;
  executorType: ExecutorType;
  owner: string;
  status: "allocated" | "shared" | "constrained" | "standby";
  capabilityIds: string[];
  toolIds: string[];
  note: string;
}

export interface ExecutorAssignment {
  id: string;
  taskId: string;
  taskTitle: string;
  executorId: string;
  executorType: ExecutorType;
  owner: string;
  status: "queued" | "running" | "waiting" | "completed" | "failed";
  assignedAt: string;
  note: string;
}

export interface ExecutionProgress {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  runningTasks: number;
  waitingTasks: number;
  completionRate: number;
  currentStage: string;
}

export interface ExecutionEvent {
  id: string;
  type: ExecutionEventType;
  timestamp: string;
  summary: string;
  taskId?: string;
  owner?: string;
}

export interface ExecutionTelemetry {
  executionDuration: string;
  executionDurationMinutes: number;
  queueTime: string;
  retryCount: number;
  failureCount: number;
  rollbackCount: number;
  cancellationCount: number;
  successRate: number;
  completionRate: number;
  averageTaskTime: string;
}

export interface ExecutionSummaryRecord {
  headline: string;
  outcome: string;
  nextStep: string;
  explanation: string;
}

export interface ExecutionSession
  extends DownstreamReferenceIds, PipelineRecordTimestamps {
  id: string;
  orchestrationId: string;
  planId: string;
  reasoningId: string;
  governanceId: string;
  status: ExecutionState;
  startedAt: string;
  endedAt?: string;
  executionState: ExecutionState;
  readiness: ExecutionReadiness;
  executors: AbstractExecutor[];
  executorAssignments: ExecutorAssignment[];
  progress: ExecutionProgress;
  completedTasks: string[];
  failedTasks: string[];
  retryCount: number;
  rollbackCount: number;
  telemetry: ExecutionTelemetry;
  events: ExecutionEvent[];
  summary: ExecutionSummaryRecord;
  confidence: number;
  riskLevel: CoreRiskLevel;
  orchestration: OrchestrationBlueprint;
}

export interface ExecutionHistoryRecord {
  id: string;
  title: string;
  state: ExecutionState;
  owner: string;
  progressLabel: string;
  outcome: string;
  timestamp: string;
}

export interface ExecutionMetrics {
  runningSessions: number;
  queuedSessions: number;
  completedSessions: number;
  failedSessions: number;
  retryRate: number;
  executionHealth: number;
  averageDuration: string;
  openSessions: number;
  averageConfidence: number;
  latestSummary: string;
  healthBadge: BadgeVariant;
}
