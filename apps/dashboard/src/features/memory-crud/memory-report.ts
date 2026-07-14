/*
 * Memory CRUD — report.
 */

import { averageLatency, countByLifecycle } from "@/features/crud-core/lifecycle-report";
import { getSnapshot } from "./memory-adapter";
import { getAuditCount } from "./memory-audit";
import { getHistoryCount } from "./memory-history";
import { getTelemetry } from "./memory-telemetry";
import type { MemoryTelemetryState, MemoryType } from "./types";

export interface MemoryReport {
  total: number;
  active: number;
  archived: number;
  deleted: number;
  telemetry: MemoryTelemetryState;
  historyCount: number;
  auditCount: number;
  avgLatencyMs: number;
  ownerCount: number;
  types: Record<MemoryType, number>;
}

export function buildReport(): MemoryReport {
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
    ownerCount: new Set(all.map((record) => `${record.ownerType}:${record.ownerId}`)).size,
    types: {
      Conversation: all.filter((record) => record.memoryType === "Conversation").length,
      Decision: all.filter((record) => record.memoryType === "Decision").length,
      Fact: all.filter((record) => record.memoryType === "Fact").length,
      Procedure: all.filter((record) => record.memoryType === "Procedure").length,
      Policy: all.filter((record) => record.memoryType === "Policy").length,
      Customer: all.filter((record) => record.memoryType === "Customer").length,
      Project: all.filter((record) => record.memoryType === "Project").length,
      Organization: all.filter((record) => record.memoryType === "Organization").length,
      Agent: all.filter((record) => record.memoryType === "Agent").length,
      Workflow: all.filter((record) => record.memoryType === "Workflow").length,
    },
  };
}
