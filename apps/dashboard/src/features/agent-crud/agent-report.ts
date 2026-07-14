/*
 * Agent CRUD — report.
 */

import { averageLatency, countByLifecycle } from "@/features/crud-core/lifecycle-report";
import { getSnapshot } from "./agent-adapter";
import { getAuditCount } from "./agent-audit";
import { getHistoryCount } from "./agent-history";
import { getTelemetry } from "./agent-telemetry";
import type { AgentTelemetryState } from "./types";

export interface AgentReport {
  total: number;
  active: number;
  archived: number;
  deleted: number;
  telemetry: AgentTelemetryState;
  historyCount: number;
  auditCount: number;
  avgLatencyMs: number;
  departments: number;
  providers: number;
}

export function buildReport(): AgentReport {
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
    providers: new Set(all.map((record) => record.provider)).size,
  };
}
