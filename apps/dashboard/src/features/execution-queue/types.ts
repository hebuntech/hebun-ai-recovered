/*
 * Execution Queue — types.
 *
 * Phase 77 turns the deterministic, recomputed Live Dispatch projection into a
 * STATEFUL in-memory execution queue that survives re-renders. It reuses every
 * upstream model verbatim (Live Dispatch, Readiness, Execution, Command Bus) and
 * only adds the stateful queue lifecycle on top.
 *
 * Pipeline:
 *   Execution Readiness → Live Dispatch → Execution Queue → Queue Lifecycle →
 *   Execution Monitor
 *
 * Everything stays offline and deterministic: no providers, no APIs, no LLM, no
 * database, no timers, no wall clock, no randomness, no async workers. State
 * advances only through validated, synchronous service calls.
 */

import type { BadgeVariant } from "@/components/ui/badge";
import type { PlanPriority } from "@/features/task-planning";
import type { DispatchTraceability } from "@/features/live-dispatch";

/* ------------------------------------------------------- Execution state - */

export type ExecutionState =
  | "queued"
  | "preparing"
  | "executing"
  | "paused"
  | "waiting-approval"
  | "waiting-dependencies"
  | "retrying"
  | "completed"
  | "failed"
  | "cancelled";

/** The ten supported stateful queue operations. */
export type QueueOperation =
  | "enqueue"
  | "dequeue"
  | "start"
  | "pause"
  | "resume"
  | "retry"
  | "cancel"
  | "complete"
  | "fail"
  | "reset";

/* ---------------------------------------------------------- Transitions -- */

export interface TransitionRecord {
  queueId: string;
  dispatchId: string;
  commandId: string;
  operation: QueueOperation;
  from: ExecutionState | null;
  to: ExecutionState;
  reason: string;
  /** Synthetic monotonic sequence — never a wall clock. */
  seq: number;
}

/** Result of attempting one operation on one entry. */
export interface TransitionOutcome {
  ok: boolean;
  from: ExecutionState | null;
  to: ExecutionState | null;
  reason: string;
  rejected?: boolean;
}

/* ---------------------------------------------------------- Queue entry -- */

export interface ExecutionQueueEntry {
  id: string;
  queueId: string;
  dispatchId: string;
  commandId: string;
  commandType: string;
  commandLabel: string;
  title: string;
  agentId: string;
  agentName: string;
  priority: PlanPriority;
  queuePosition: number;
  state: ExecutionState;
  retryCount: number;
  /** Deterministic terminal target inherited from Live Dispatch. */
  plannedOutcome: "completed" | "failed";
  history: TransitionRecord[];
  traceability: DispatchTraceability;
}

/* --------------------------------------------------------------- Views --- */

export interface QueueProgress {
  total: number;
  queued: number;
  preparing: number;
  executing: number;
  paused: number;
  waitingApproval: number;
  waitingDependencies: number;
  retrying: number;
  completed: number;
  failed: number;
  cancelled: number;
  /** 0-100 share that reached the completed terminal state. */
  completionPercent: number;
  /** Non-terminal entries still in the queue. */
  depth: number;
}

export interface QueueTelemetry {
  queued: number;
  running: number;
  paused: number;
  retrying: number;
  completed: number;
  failed: number;
  cancelled: number;
  /** 0-100 completed / (completed + failed + cancelled). */
  throughput: number;
  queueDepth: number;
  transitionCount: number;
}

export interface QueueEvent {
  id: string;
  type:
    | "queue.enqueued"
    | "queue.started"
    | "queue.paused"
    | "queue.resumed"
    | "queue.retried"
    | "queue.completed"
    | "queue.failed"
    | "queue.cancelled"
    | "queue.reset"
    | "queue.rejected";
  dispatchId: string;
  commandId: string;
  detail: string;
  seq: number;
}

export type ExecutionHealth = "healthy" | "degraded" | "stalled" | "idle";

export interface QueueReport {
  queueId: string;
  agentId: string;
  agentName: string;
  depth: number;
  completed: number;
  failed: number;
  paused: number;
  retrying: number;
  completionPercent: number;
  throughput: number;
  transitionCount: number;
  health: ExecutionHealth;
  summary: string;
}

export interface AgentQueueView {
  queueId: string;
  agentId: string;
  agentName: string;
  entries: ExecutionQueueEntry[];
  history: TransitionRecord[];
  events: QueueEvent[];
  progress: QueueProgress;
  telemetry: QueueTelemetry;
  report: QueueReport;
}

/* ------------------------------------------------ Executive aggregation -- */

export interface ExecutiveQueueRow {
  queueId: string;
  agentId: string;
  agentName: string;
  depth: number;
  running: number;
  paused: number;
  retrying: number;
  completed: number;
  failed: number;
  throughput: number;
  transitionCount: number;
  health: ExecutionHealth;
  badge: BadgeVariant;
}

export interface ExecutiveQueueMonitor {
  rows: ExecutiveQueueRow[];
  totals: {
    activeQueues: number;
    entries: number;
    queueDepth: number;
    running: number;
    paused: number;
    retrying: number;
    completed: number;
    failed: number;
    cancelled: number;
    throughput: number;
    transitionCount: number;
    /** Transitions per active queue — deterministic transition-rate signal. */
    transitionRate: number;
    health: ExecutionHealth;
  };
}
