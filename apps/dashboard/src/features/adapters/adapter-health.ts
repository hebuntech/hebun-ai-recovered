import type { AdapterHealthStatus, ExecutionHealth } from "@/features/adapters/types";
import type { BadgeVariant } from "@/components/ui/badge";

export const healthStatuses: AdapterHealthStatus[] = [
  "Healthy",
  "Degraded",
  "Unavailable",
  "Maintenance",
  "Unknown",
];

export const healthVariant: Record<AdapterHealthStatus, BadgeVariant> = {
  Healthy: "success",
  Degraded: "warning",
  Unavailable: "error",
  Maintenance: "info",
  Unknown: "neutral",
};

/** deterministic health from success rate + latency */
export function deriveHealth(successRate: number, latencyMs: number, since: string): ExecutionHealth {
  let status: AdapterHealthStatus;
  if (successRate >= 95 && latencyMs <= 50) status = "Healthy";
  else if (successRate >= 80) status = "Degraded";
  else status = "Unavailable";
  return {
    status,
    since,
    latencyMs,
    successRate,
    note:
      status === "Healthy"
        ? "Operating within thresholds"
        : status === "Degraded"
          ? "Elevated latency or reduced success rate"
          : "Not accepting executions",
  };
}
