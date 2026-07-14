/*
 * Execution Queue — service facade.
 *
 * The only public entry point. It guarantees each agent's queue is seeded and
 * advanced exactly once (statefulness), exposes the ten validated operations,
 * and projects the per-agent view + the executive monitor.
 *
 * Reuses the whole upstream chain via Live Dispatch. No providers, no APIs, no
 * persistence changes, no business-data mutation.
 */

import type { BadgeVariant } from "@/components/ui/badge";
import { getSnapshot as getAgentSnapshot } from "@/features/agent-crud";
import { seedAgentQueue, applyOperation } from "./queue-engine";
import { advanceAgentQueue } from "./queue-runner";
import { isSeeded, getEntriesByAgent, getEntries } from "./queue-store";
import { buildProgress, buildReport } from "./queue-report";
import { buildTelemetry } from "./queue-telemetry";
import { buildHistory } from "./queue-history";
import { buildEvents } from "./queue-events";
import type {
  AgentQueueView,
  ExecutionHealth,
  ExecutiveQueueMonitor,
  ExecutiveQueueRow,
  QueueOperation,
  TransitionOutcome,
} from "./types";

export function executionHealthBadge(health: ExecutionHealth): BadgeVariant {
  switch (health) {
    case "healthy":
      return "success";
    case "degraded":
      return "warning";
    case "stalled":
      return "error";
    case "idle":
    default:
      return "neutral";
  }
}

/**
 * Seed + advance an agent's queue exactly once. Subsequent calls are no-ops —
 * the queue is already stateful in the store, so re-renders never recompute it.
 */
export function ensureAgentQueue(agentId: string): void {
  if (isSeeded(agentId)) return;
  seedAgentQueue(agentId);
  advanceAgentQueue(agentId);
}

function buildView(agentId: string): AgentQueueView {
  const entries = getEntriesByAgent(agentId);
  const first = entries[0];
  const agentName = first?.agentName ?? agentId;
  const queueId = first?.queueId ?? `queue_${agentId}`;

  const progress = buildProgress(entries);
  const telemetry = buildTelemetry(entries);
  const history = buildHistory(entries);
  const events = buildEvents(history);
  const report = buildReport(queueId, agentId, agentName, entries, progress, telemetry);

  return { queueId, agentId, agentName, entries, history, events, progress, telemetry, report };
}

/** Per-agent stateful queue view. Ensures the queue is seeded first. */
export function getAgentQueue(agentId: string): AgentQueueView {
  ensureAgentQueue(agentId);
  return buildView(agentId);
}

/* --------------------------------------------------------- Operations ---- */

/** Apply any of the ten operations to a queue entry. Illegal ops are rejected. */
export function runQueueOperation(
  entryId: string,
  op: QueueOperation,
  reason?: string
): TransitionOutcome {
  return applyOperation(entryId, op, reason);
}

export const startEntry = (id: string) => applyOperation(id, "start");
export const dequeueEntry = (id: string) => applyOperation(id, "dequeue");
export const pauseEntry = (id: string) => applyOperation(id, "pause");
export const resumeEntry = (id: string) => applyOperation(id, "resume");
export const retryEntry = (id: string) => applyOperation(id, "retry");
export const cancelEntry = (id: string) => applyOperation(id, "cancel");
export const completeEntry = (id: string) => applyOperation(id, "complete");
export const failEntry = (id: string) => applyOperation(id, "fail");
export const resetEntry = (id: string) => applyOperation(id, "reset");

/* ---------------------------------------------------- Executive monitor -- */

function activeAgentIds(): string[] {
  return getAgentSnapshot()
    .filter((agent) => agent.lifecycleStatus === "active")
    .slice()
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((agent) => agent.id);
}

export function getExecutiveQueueMonitor(): ExecutiveQueueMonitor {
  const ids = activeAgentIds();
  ids.forEach(ensureAgentQueue);

  const rows: ExecutiveQueueRow[] = ids.map((agentId) => {
    const view = buildView(agentId);
    return {
      queueId: view.queueId,
      agentId: view.agentId,
      agentName: view.agentName,
      depth: view.progress.depth,
      running: view.telemetry.running,
      paused: view.telemetry.paused,
      retrying: view.telemetry.retrying,
      completed: view.telemetry.completed,
      failed: view.telemetry.failed,
      throughput: view.telemetry.throughput,
      transitionCount: view.telemetry.transitionCount,
      health: view.report.health,
      badge: executionHealthBadge(view.report.health),
    };
  });

  const all = getEntries();
  const telemetry = buildTelemetry(all);
  const activeQueues = rows.filter((row) => row.transitionCount > 0).length;
  const transitionRate =
    activeQueues === 0 ? 0 : Math.round(telemetry.transitionCount / activeQueues);
  const health: ExecutionHealth =
    all.length === 0
      ? "idle"
      : telemetry.failed > 0 || telemetry.cancelled > 0
        ? "degraded"
        : telemetry.completed > 0
          ? "healthy"
          : "stalled";

  return {
    rows,
    totals: {
      activeQueues,
      entries: all.length,
      queueDepth: telemetry.queueDepth,
      running: telemetry.running,
      paused: telemetry.paused,
      retrying: telemetry.retrying,
      completed: telemetry.completed,
      failed: telemetry.failed,
      cancelled: telemetry.cancelled,
      throughput: telemetry.throughput,
      transitionCount: telemetry.transitionCount,
      transitionRate,
      health,
    },
  };
}
