/*
 * offline-metrics.ts — deterministic headline metrics for the widget, summary
 * tiles and director page.
 */

import type { BadgeVariant } from "@/components/ui/badge";
import { offlineSessions } from "@/features/offline-execution/offline-execution-engine";
import { offlineReports } from "@/features/offline-execution/offline-report";
import { validateSession } from "@/features/offline-execution/offline-validator";
import type { OfflineExecutionMetrics } from "@/features/offline-execution/types";

const sessionCount = offlineSessions.length;
const totalTasks = offlineSessions.reduce((s, x) => s + x.tasks.length, 0);
const simulatedResults = offlineSessions.reduce((s, x) => s + x.telemetry.simulatedResultCount, 0);

const avg = (values: number[]) => (values.length === 0 ? 0 : Math.round(values.reduce((s, v) => s + v, 0) / values.length));

const traceabilityScore = avg(offlineSessions.map((s) => s.traceabilityScore));
const auditCoverage = avg(offlineReports.map((r) => r.auditCoverage));
const simulationEnforcement =
  totalTasks === 0
    ? 0
    : Math.round(
        (offlineSessions.reduce((s, x) => s + x.telemetry.simulationEnforcedCount, 0) / totalTasks) * 100
      );
const validSessions = offlineSessions.filter((s) => validateSession(s).valid).length;
const pipelineHealth = sessionCount === 0 ? 0 : Math.round((validSessions / sessionCount) * 100);
const futureLiveBlocked = offlineReports.every((r) => r.futureLiveBlocked);

const badge: BadgeVariant = pipelineHealth >= 90 ? "success" : pipelineHealth >= 75 ? "warning" : "error";

export const offlineExecutionMetrics: OfflineExecutionMetrics = {
  offlineSessions: sessionCount,
  simulatedResults,
  traceabilityScore,
  auditCoverage,
  simulationEnforcement,
  pipelineHealth,
  futureLiveBlocked,
  badge,
};
