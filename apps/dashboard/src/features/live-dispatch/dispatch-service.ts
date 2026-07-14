/*
 * Live Dispatch — service facade.
 *
 * Public read API. Reuses Execution Readiness verbatim (which itself flows the
 * whole chain: Memory → Context → Reasoning → Planning → Bridge → Simulation →
 * Approval → Readiness) and turns each READY result into a deterministic
 * dispatch. No command dispatch to providers, no mutation, no persistence.
 */

import type { BadgeVariant } from "@/components/ui/badge";
import {
  getAgentExecutionReadiness,
  getExecutiveExecutionReadiness,
} from "@/features/execution-readiness";
import { buildAgentDispatch } from "./dispatch-engine";
import type {
  AgentDispatchResult,
  DispatchHealth,
  ExecutiveDispatchMonitor,
  ExecutiveDispatchRow,
} from "./types";

export function dispatchHealthBadge(health: DispatchHealth): BadgeVariant {
  switch (health) {
    case "healthy":
      return "success";
    case "degraded":
      return "warning";
    case "stalled":
    default:
      return "neutral";
  }
}

/** Live dispatch for a single agent by id. Null when the agent is unknown. */
export function getAgentLiveDispatch(agentId: string): AgentDispatchResult | null {
  const readiness = getAgentExecutionReadiness(agentId);
  return readiness ? buildAgentDispatch(readiness) : null;
}

/** Live dispatch for every active agent — deterministic id-ascending order. */
export function getExecutiveLiveDispatch(): AgentDispatchResult[] {
  return getExecutiveExecutionReadiness().map((readiness) => buildAgentDispatch(readiness));
}

/** Roll every agent dispatch up into the Executive Dispatch Monitor. */
export function getExecutiveDispatchMonitor(): ExecutiveDispatchMonitor {
  const results = getExecutiveLiveDispatch();

  const rows: ExecutiveDispatchRow[] = results.map((r) => ({
    agentId: r.agentId,
    agentName: r.agentName,
    readinessStatus: r.readinessStatus,
    queueDepth: r.queue.length,
    queued: r.progress.queued,
    executing: r.progress.executing,
    completed: r.progress.completed,
    failed: r.progress.failed,
    rejected: r.rejected.length,
    completionPercent: r.progress.completionPercent,
    throughput: r.telemetry.throughput,
    health: r.report.health,
    badge: dispatchHealthBadge(r.report.health),
  }));

  const sum = (fn: (r: AgentDispatchResult) => number) =>
    results.reduce((acc, r) => acc + fn(r), 0);

  const admittedAgents = results.filter((r) => r.admitted).length;
  const readyAgents = results.filter((r) => r.readinessStatus === "ready").length;
  const accepted = sum((r) => r.telemetry.accepted);
  const completed = sum((r) => r.progress.completed);
  const failed = sum((r) => r.progress.failed);
  const cancelled = sum((r) => r.progress.cancelled);

  const throughput = accepted === 0 ? 0 : Math.round((completed / accepted) * 100);
  const health: DispatchHealth =
    admittedAgents === 0 ? "stalled" : failed > 0 || cancelled > 0 ? "degraded" : "healthy";

  return {
    rows,
    totals: {
      agents: results.length,
      readyAgents,
      admittedAgents,
      candidates: sum((r) => r.telemetry.candidates),
      queued: sum((r) => r.progress.queued),
      preparing: sum((r) => r.progress.preparing),
      dispatched: sum((r) => r.progress.dispatched),
      executing: sum((r) => r.progress.executing),
      completed,
      failed,
      cancelled,
      rejected: sum((r) => r.rejected.length),
      throughput,
      readinessVsDispatched: `${readyAgents} ready · ${admittedAgents} dispatched`,
      health,
    },
  };
}
