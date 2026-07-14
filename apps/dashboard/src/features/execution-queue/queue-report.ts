/*
 * Execution Queue — progress, health, and report.
 *
 * Pure projections over a set of entries + its telemetry. Deterministic.
 */

import { isTerminal } from "./queue-transitions";
import type {
  ExecutionHealth,
  ExecutionQueueEntry,
  QueueProgress,
  QueueReport,
  QueueTelemetry,
} from "./types";

function count(entries: ExecutionQueueEntry[], state: ExecutionQueueEntry["state"]): number {
  return entries.filter((entry) => entry.state === state).length;
}

export function buildProgress(entries: ExecutionQueueEntry[]): QueueProgress {
  const total = entries.length;
  const completed = count(entries, "completed");
  const completionPercent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const depth = entries.filter((entry) => !isTerminal(entry.state)).length;

  return {
    total,
    queued: count(entries, "queued"),
    preparing: count(entries, "preparing"),
    executing: count(entries, "executing"),
    paused: count(entries, "paused"),
    waitingApproval: count(entries, "waiting-approval"),
    waitingDependencies: count(entries, "waiting-dependencies"),
    retrying: count(entries, "retrying"),
    completed,
    failed: count(entries, "failed"),
    cancelled: count(entries, "cancelled"),
    completionPercent,
    depth,
  };
}

export function deriveHealth(
  entries: ExecutionQueueEntry[],
  telemetry: QueueTelemetry
): ExecutionHealth {
  if (entries.length === 0) return "idle";
  if (telemetry.failed > 0 || telemetry.cancelled > 0) return "degraded";
  if (telemetry.queueDepth > 0 && telemetry.completed === 0 && telemetry.running === 0) {
    return "stalled";
  }
  return "healthy";
}

export function buildReport(
  queueId: string,
  agentId: string,
  agentName: string,
  entries: ExecutionQueueEntry[],
  progress: QueueProgress,
  telemetry: QueueTelemetry
): QueueReport {
  const health = deriveHealth(entries, telemetry);
  return {
    queueId,
    agentId,
    agentName,
    depth: progress.depth,
    completed: telemetry.completed,
    failed: telemetry.failed,
    paused: telemetry.paused,
    retrying: telemetry.retrying,
    completionPercent: progress.completionPercent,
    throughput: telemetry.throughput,
    transitionCount: telemetry.transitionCount,
    health,
    summary: `${telemetry.completed} completed · ${telemetry.failed} failed · depth ${progress.depth} · ${telemetry.transitionCount} transitions`,
  };
}
