/*
 * Workflow CRUD — report.
 */

import { averageLatency, countByLifecycle } from "@/features/crud-core/lifecycle-report";
import { getSnapshot } from "./workflow-adapter";
import { getAuditCount } from "./workflow-audit";
import { getHistoryCount } from "./workflow-history";
import { getTelemetry } from "./workflow-telemetry";
import type { WorkflowTelemetryState } from "./types";

export interface WorkflowReport {
  total: number;
  active: number;
  archived: number;
  deleted: number;
  telemetry: WorkflowTelemetryState;
  historyCount: number;
  auditCount: number;
  avgLatencyMs: number;
  departments: number;
  activeAgents: number;
}

export function buildReport(): WorkflowReport {
  const all = getSnapshot();
  const telemetry = getTelemetry();
  const counts = countByLifecycle(all);
  const mutations =
    telemetry.creates +
    telemetry.updates +
    telemetry.archives +
    telemetry.restores +
    telemetry.softDeletes;

  return {
    ...counts,
    telemetry,
    historyCount: getHistoryCount(),
    auditCount: getAuditCount(),
    avgLatencyMs: averageLatency(telemetry.totalLatencyMs, mutations),
    departments: new Set(all.map((record) => record.department)).size,
    activeAgents: new Set(all.flatMap((record) => record.assignedAgents)).size,
  };
}
