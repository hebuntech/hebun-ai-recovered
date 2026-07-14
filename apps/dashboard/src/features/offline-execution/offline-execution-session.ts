/*
 * offline-execution-session.ts — assembles a full offline execution session from
 * a context by running every plan task through the offline chain and rolling up
 * routes, invocations, runtime decisions, simulated results, audit, events and
 * telemetry. Deterministic and offline.
 */

import type { BadgeVariant } from "@/components/ui/badge";
import { runTask } from "@/features/offline-execution/offline-task-runner";
import { buildAudit } from "@/features/offline-execution/offline-audit";
import { buildEvents } from "@/features/offline-execution/offline-events";
import { buildTelemetry } from "@/features/offline-execution/offline-telemetry";
import type { OfflineExecutionContext } from "@/features/offline-execution/offline-execution-context";
import type {
  OfflineExecutionSession,
  OfflineSessionStatus,
  OfflineTaskRun,
} from "@/features/offline-execution/types";

const EPOCH = "2025-01-01T00:00:00.000Z";

function riskFor(confidence: number, blocked: boolean): "low" | "medium" | "high" {
  if (blocked) return "high";
  return confidence >= 75 ? "low" : confidence >= 50 ? "medium" : "high";
}

export function buildSession(context: OfflineExecutionContext): OfflineExecutionSession {
  const runs: OfflineTaskRun[] = context.tasks.map(runTask);

  const simulated = runs.filter((r) => r.result.status === "simulated").length;
  const blockedCount = runs.filter((r) => r.result.status === "blocked").length;
  const status: OfflineSessionStatus =
    blockedCount > 0 ? "blocked" : simulated === runs.length && runs.length > 0 ? "completed" : "partial";

  const telemetry = buildTelemetry(runs);
  const audit = buildAudit(context, runs);
  const events = buildEvents(context.planId, context.orchestrationId, runs, status);

  const confidence =
    runs.length === 0 ? 0 : Math.round(runs.reduce((s, r) => s + r.confidence, 0) / runs.length);
  const traceabilityScore =
    runs.length === 0 ? 0 : Math.round((telemetry.traceableCount / runs.length) * 100);
  const risk = riskFor(confidence, status === "blocked");

  const statusBadge: BadgeVariant = status === "completed" ? "success" : status === "partial" ? "warning" : "error";
  const riskBadge: BadgeVariant = risk === "low" ? "success" : risk === "medium" ? "warning" : "error";

  return {
    id: `oes-${context.orchestrationId}`,
    planId: context.planId,
    orchestrationId: context.orchestrationId,
    status,
    tasks: runs,
    providerRoutes: runs.map((r) => r.routing),
    invocations: runs.map((r) => r.invocation),
    runtimeDecisions: runs.map((r) => r.runtime),
    simulatedResults: runs.map((r) => r.result),
    auditTrail: audit,
    events,
    telemetry,
    confidence,
    riskLevel: risk,
    traceabilityScore,
    startedAt: EPOCH,
    completedAt: EPOCH,
    statusBadge,
    riskBadge,
  };
}
