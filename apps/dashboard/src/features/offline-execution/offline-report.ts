/*
 * offline-report.ts — explainable end-to-end offline execution report.
 */

import { offlineSessions } from "@/features/offline-execution/offline-execution-engine";
import { validateSession } from "@/features/offline-execution/offline-validator";
import type { OfflineExecutionReport, OfflineExecutionSession } from "@/features/offline-execution/types";

export function buildReport(session: OfflineExecutionSession): OfflineExecutionReport {
  const validation = validateSession(session);
  const simulationEnforced = session.tasks.every((r) => r.simulationEnforced);
  const futureLiveBlocked = session.tasks.every((r) => !(r.runtime.allowed && r.runtimeMode === "Future Live"));
  const auditCoverage = session.auditTrail.length === 9 ? 100 : Math.round((session.auditTrail.length / 9) * 100);

  return {
    sessionId: session.id,
    planId: session.planId,
    orchestrationId: session.orchestrationId,
    status: session.status,
    taskCount: session.tasks.length,
    simulatedResults: session.telemetry.simulatedResultCount,
    traceabilityScore: session.traceabilityScore,
    auditCoverage,
    simulationEnforced,
    futureLiveBlocked,
    confidence: session.confidence,
    riskLevel: session.riskLevel,
    valid: validation.valid,
    explanation: `Plan ${session.planId} executed end-to-end offline across ${session.tasks.length} tasks: ${session.telemetry.simulatedResultCount} simulated results, ${session.traceabilityScore}% traceable, simulation ${simulationEnforced ? "enforced" : "NOT enforced"}, Future Live ${futureLiveBlocked ? "blocked" : "LEAKED"}.`,
    badge: session.statusBadge,
  };
}

export const offlineReports: OfflineExecutionReport[] = offlineSessions.map(buildReport);
