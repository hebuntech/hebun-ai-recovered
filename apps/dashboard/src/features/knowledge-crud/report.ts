/*
 * Knowledge CRUD — report. Rolls up nodes, relationships and telemetry.
 */

import { averageLatency, countByLifecycle } from "@/features/crud-core/lifecycle-report";
import { getNodeSnapshot } from "./node-adapter";
import { getRelationshipSnapshot } from "./relationship-adapter";
import { getAuditCount } from "./audit";
import { getHistoryCount } from "./history";
import { getTelemetry } from "./telemetry";
import type { KnowledgeTelemetryState } from "./types";

export interface KnowledgeReport {
  total: number;
  active: number;
  archived: number;
  deleted: number;
  relationshipsTotal: number;
  relationshipsActive: number;
  relationshipsDeleted: number;
  ownerCount: number;
  telemetry: KnowledgeTelemetryState;
  historyCount: number;
  auditCount: number;
  avgLatencyMs: number;
}

export function buildReport(): KnowledgeReport {
  const nodes = getNodeSnapshot();
  const relationships = getRelationshipSnapshot();
  const telemetry = getTelemetry();
  const counts = countByLifecycle(nodes);
  const mutations =
    telemetry.creates +
    telemetry.updates +
    telemetry.archives +
    telemetry.restores +
    telemetry.softDeletes +
    telemetry.relationshipOps;

  return {
    ...counts,
    relationshipsTotal: relationships.length,
    relationshipsActive: relationships.filter((edge) => edge.lifecycleStatus === "active").length,
    relationshipsDeleted: relationships.filter((edge) => edge.lifecycleStatus === "deleted").length,
    ownerCount: new Set(nodes.map((node) => `${node.ownerType}:${node.ownerId}`)).size,
    telemetry,
    historyCount: getHistoryCount(),
    auditCount: getAuditCount(),
    avgLatencyMs: averageLatency(telemetry.totalLatencyMs, mutations),
  };
}
