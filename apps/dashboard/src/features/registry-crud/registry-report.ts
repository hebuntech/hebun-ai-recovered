/*
 * Registry CRUD — report.
 *
 * Rolls up the store and telemetry into a single deterministic summary for the UI.
 */

import { getSnapshot } from "./registry-adapter";
import { getTelemetry } from "./registry-telemetry";
import { getHistoryCount } from "./registry-history";
import { getAuditCount } from "./registry-audit";
import { averageLatency, countByLifecycle } from "@/features/crud-core/lifecycle-report";
import type { RegistryTelemetryState } from "./types";

export interface RegistryReport {
  total: number;
  active: number;
  archived: number;
  deleted: number;
  telemetry: RegistryTelemetryState;
  historyCount: number;
  auditCount: number;
  avgLatencyMs: number;
}

export function buildReport(): RegistryReport {
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
  };
}
