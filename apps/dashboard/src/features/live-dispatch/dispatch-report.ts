/*
 * Live Dispatch — report + progress.
 *
 * Derives the queue progress breakdown, a dispatch health signal, and the
 * compact per-agent report. Pure projection over the settled queue + telemetry.
 */

import type { ExecutionReadinessStatus } from "@/features/execution-readiness";
import type {
  DispatchHealth,
  DispatchProgress,
  DispatchQueueItem,
  DispatchReport,
  DispatchTelemetry,
  QueueState,
  RejectedDispatch,
} from "./types";

function countState(queue: DispatchQueueItem[], state: QueueState): number {
  return queue.filter((q) => q.state === state).length;
}

export function buildDispatchProgress(queue: DispatchQueueItem[]): DispatchProgress {
  const total = queue.length;
  const completed = countState(queue, "completed");
  const completionPercent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return {
    total,
    queued: countState(queue, "queued"),
    preparing: countState(queue, "preparing"),
    dispatched: countState(queue, "dispatched"),
    executing: countState(queue, "executing"),
    completed,
    failed: countState(queue, "failed"),
    cancelled: countState(queue, "cancelled"),
    completionPercent,
  };
}

/** Deterministic health signal from failure ratio + admission. */
export function deriveHealth(
  admitted: boolean,
  telemetry: DispatchTelemetry
): DispatchHealth {
  if (!admitted) return "stalled";
  if (telemetry.failed > 0 || telemetry.cancelled > 0) return "degraded";
  return "healthy";
}

interface ReportInputs {
  agentId: string;
  agentName: string;
  readinessStatus: ExecutionReadinessStatus;
  admitted: boolean;
  admissionReason: string;
  queue: DispatchQueueItem[];
  rejected: RejectedDispatch[];
  telemetry: DispatchTelemetry;
}

export function buildDispatchReport(
  inputs: ReportInputs
): { progress: DispatchProgress; report: DispatchReport } {
  const { agentId, agentName, readinessStatus, admitted, admissionReason, queue, rejected, telemetry } =
    inputs;

  const progress = buildDispatchProgress(queue);
  const health = deriveHealth(admitted, telemetry);

  const dispatchSummary = admitted
    ? `${telemetry.completed}/${telemetry.accepted} completed · ${telemetry.failed} failed · ${rejected.length} rejected`
    : `0 dispatched · ${rejected.length} rejected · ${readinessStatus}`;

  return {
    progress,
    report: {
      agentId,
      agentName,
      readinessStatus,
      admitted,
      admissionReason,
      queueDepth: queue.length,
      completed: telemetry.completed,
      failed: telemetry.failed,
      rejected: rejected.length,
      completionPercent: progress.completionPercent,
      throughput: telemetry.throughput,
      health,
      dispatchSummary,
    },
  };
}
