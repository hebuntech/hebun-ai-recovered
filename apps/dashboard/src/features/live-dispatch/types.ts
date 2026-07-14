/*
 * Live Dispatch — types.
 *
 * The final internal layer of the deterministic execution chain:
 *
 *   Memory Engine → Agent Context → Agent Reasoning → Task Planning →
 *   Execution Bridge → Execution Simulation → Human Approval →
 *   Execution Readiness → Live Command Dispatch
 *
 * Live Dispatch turns READY commands into real, internally queued commands and
 * advances them through a deterministic queue lifecycle. Everything stays
 * offline: no providers, no APIs, no timers, no async workers, no wall clock.
 * Same Execution Plan → identical dispatch order → identical execution states.
 *
 * It REUSES upstream models verbatim (Command Bus lifecycle, Execution,
 * Readiness, Planning, Approval) and never duplicates them.
 */

import type { BadgeVariant } from "@/components/ui/badge";
import type { PlanPriority } from "@/features/task-planning";
import type { ExecutionReadinessStatus } from "@/features/execution-readiness";

/* ---------------------------------------------------------- Queue state -- */

/** Deterministic internal queue lifecycle (mirrors the Command Bus states). */
export type QueueState =
  | "queued"
  | "preparing"
  | "dispatched"
  | "executing"
  | "completed"
  | "failed"
  | "cancelled";

export type DispatchDecision = "accepted" | "rejected";

/** Why an otherwise-candidate command was refused entry to the live queue. */
export type DispatchRejectReason =
  | "validation-failed"
  | "approval-rejected"
  | "blocked"
  | "dependencies-incomplete"
  | "approval-pending"
  | "not-ready";

/* ---------------------------------------------------- Deterministic time - */

/**
 * A logical, monotonic tick — never a wall clock. `at` is a stable synthetic
 * label ("t00042") so the same plan renders identical timestamps every time.
 */
export interface DispatchLifecycleEntry {
  state: QueueState;
  detail: string;
  tick: number;
  at: string;
}

/* ---------------------------------------------------------- Traceability - */

/** Reuses the upstream trace chain: decision → reasoning → context → memory. */
export interface DispatchTraceability {
  agentId: string;
  commandId: string;
  commandType: string;
  taskId: string;
  taskTitle: string;
  decision: string;
  reasoning: string;
  context: string;
  memory: string;
  knowledge: string;
}

/* -------------------------------------------------------- Queued command - */

export interface DispatchQueueItem {
  dispatchId: string;
  commandId: string;
  commandType: string;
  commandLabel: string;
  title: string;
  agentId: string;
  agentName: string;
  priority: PlanPriority;
  queuePosition: number;
  state: QueueState;
  lifecycle: DispatchLifecycleEntry[];
  queuedAt: string;
  dispatchedAt: string;
  settledAt: string;
  estimatedDuration: number;
  traceability: DispatchTraceability;
}

export interface RejectedDispatch {
  commandId: string;
  commandType: string;
  commandLabel: string;
  title: string;
  agentId: string;
  agentName: string;
  priority: PlanPriority;
  reason: DispatchRejectReason;
  detail: string;
  traceability: DispatchTraceability;
}

/* --------------------------------------------------------------- Views --- */

export interface DispatchProgress {
  total: number;
  queued: number;
  preparing: number;
  dispatched: number;
  executing: number;
  completed: number;
  failed: number;
  cancelled: number;
  /** 0-100 share of the queue that reached a completed terminal state. */
  completionPercent: number;
}

export interface DispatchTelemetry {
  candidates: number;
  accepted: number;
  rejected: number;
  completed: number;
  failed: number;
  cancelled: number;
  rejectedByReason: Record<DispatchRejectReason, number>;
  /** 0-100 completed / accepted. Deterministic throughput signal. */
  throughput: number;
  ticksConsumed: number;
}

export interface DispatchHistoryEntry {
  id: string;
  stage: "admit" | "queue" | "prepare" | "dispatch" | "execute" | "settle";
  detail: string;
  tick: number;
}

export interface DispatchEvent {
  id: string;
  type:
    | "command.queued"
    | "command.dispatched"
    | "command.completed"
    | "command.failed"
    | "command.cancelled"
    | "command.rejected";
  commandId: string;
  detail: string;
  tick: number;
}

export type DispatchHealth = "healthy" | "degraded" | "stalled";

export interface DispatchReport {
  agentId: string;
  agentName: string;
  readinessStatus: ExecutionReadinessStatus;
  admitted: boolean;
  admissionReason: string;
  queueDepth: number;
  completed: number;
  failed: number;
  rejected: number;
  completionPercent: number;
  throughput: number;
  health: DispatchHealth;
  dispatchSummary: string;
}

export interface AgentDispatchResult {
  agentId: string;
  agentName: string;
  readinessStatus: ExecutionReadinessStatus;
  admitted: boolean;
  admissionReason: string;
  queue: DispatchQueueItem[];
  rejected: RejectedDispatch[];
  progress: DispatchProgress;
  telemetry: DispatchTelemetry;
  history: DispatchHistoryEntry[];
  events: DispatchEvent[];
  report: DispatchReport;
}

/* ------------------------------------------------ Executive aggregation -- */

export interface ExecutiveDispatchRow {
  agentId: string;
  agentName: string;
  readinessStatus: ExecutionReadinessStatus;
  queueDepth: number;
  queued: number;
  executing: number;
  completed: number;
  failed: number;
  rejected: number;
  completionPercent: number;
  throughput: number;
  health: DispatchHealth;
  badge: BadgeVariant;
}

export interface ExecutiveDispatchMonitor {
  rows: ExecutiveDispatchRow[];
  totals: {
    agents: number;
    readyAgents: number;
    admittedAgents: number;
    candidates: number;
    queued: number;
    preparing: number;
    dispatched: number;
    executing: number;
    completed: number;
    failed: number;
    cancelled: number;
    rejected: number;
    /** Global 0-100 completed / accepted. */
    throughput: number;
    /** Ready plans vs plans that actually produced a live queue. */
    readinessVsDispatched: string;
    health: DispatchHealth;
  };
}
