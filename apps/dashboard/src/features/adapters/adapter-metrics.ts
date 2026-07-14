import { adapterRecords } from "@/features/adapters/adapter-registry";
import { capabilityCatalog } from "@/features/adapters/adapter-capabilities";
import { coveredCapabilityKinds } from "@/features/adapters/adapter-queries";
import type { AdapterMetrics } from "@/features/adapters/types";
import type { BadgeVariant } from "@/components/ui/badge";

const registered = adapterRecords.length;
const healthy = adapterRecords.filter((r) => r.health.status === "Healthy").length;
const degraded = adapterRecords.filter((r) => r.health.status === "Degraded").length;
const unavailable = adapterRecords.filter((r) => r.health.status === "Unavailable").length;
const simulationReady = adapterRecords.some((r) => r.metadata.simulation && r.health.status === "Healthy");
const capabilitiesCovered = coveredCapabilityKinds().length;
const totalExecutions = adapterRecords.reduce((sum, r) => sum + r.telemetry.executions, 0);
const succeeded = adapterRecords.reduce((sum, r) => sum + r.telemetry.succeeded, 0);
const successRate = totalExecutions ? Math.round((succeeded / totalExecutions) * 100) : 100;

const healthBadge: BadgeVariant =
  registered > 0 && healthy === registered ? "success" : unavailable > 0 ? "error" : "warning";

export const adapterMetrics: AdapterMetrics = {
  registered,
  healthy,
  degraded,
  unavailable,
  simulationReady,
  capabilitiesCovered,
  capabilitiesTotal: capabilityCatalog.length,
  totalExecutions,
  successRate,
  healthBadge,
};
