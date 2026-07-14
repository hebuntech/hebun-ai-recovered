import type { BadgeVariant } from "@/components/ui/badge";
import type { ExecutionReadinessStatus } from "./types";

export function executionReadinessBadge(
  status: ExecutionReadinessStatus
): BadgeVariant {
  return status === "ready" ? "success" : "warning";
}

export * from "./types";
export * from "./readiness-checks";
export * from "./readiness-score";
export * from "./readiness-report";
export * from "./readiness-validator";
export * from "./readiness-history";
export * from "./readiness-telemetry";
export * from "./readiness-engine";
export * from "./readiness-service";
