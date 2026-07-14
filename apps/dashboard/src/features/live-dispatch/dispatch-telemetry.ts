/*
 * Live Dispatch — telemetry.
 *
 * Deterministic counters over the settled queue and the rejected tail. Pure:
 * derived entirely from its inputs, no stored state.
 */

import type {
  DispatchQueueItem,
  DispatchRejectReason,
  DispatchTelemetry,
  RejectedDispatch,
} from "./types";

const EMPTY_REASONS: Record<DispatchRejectReason, number> = {
  "validation-failed": 0,
  "approval-rejected": 0,
  blocked: 0,
  "dependencies-incomplete": 0,
  "approval-pending": 0,
  "not-ready": 0,
};

export function buildDispatchTelemetry(
  queue: DispatchQueueItem[],
  rejected: RejectedDispatch[],
  ticksConsumed: number
): DispatchTelemetry {
  const completed = queue.filter((q) => q.state === "completed").length;
  const failed = queue.filter((q) => q.state === "failed").length;
  const cancelled = queue.filter((q) => q.state === "cancelled").length;

  const rejectedByReason = { ...EMPTY_REASONS };
  for (const item of rejected) rejectedByReason[item.reason] += 1;

  const accepted = queue.length;
  const throughput = accepted === 0 ? 0 : Math.round((completed / accepted) * 100);

  return {
    candidates: accepted + rejected.length,
    accepted,
    rejected: rejected.length,
    completed,
    failed,
    cancelled,
    rejectedByReason,
    throughput,
    ticksConsumed,
  };
}
