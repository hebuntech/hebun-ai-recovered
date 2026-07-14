import type { BadgeVariant } from "@/components/ui/badge";
import type { ApprovalRisk } from "@/types";
import type { HumanApprovalStatus } from "./types";

export function approvalStatusBadge(status: HumanApprovalStatus): BadgeVariant {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "error";
    case "changes-requested":
      return "info";
    case "pending":
    default:
      return "warning";
  }
}

export function approvalRiskBadge(risk: ApprovalRisk): BadgeVariant {
  switch (risk) {
    case "critical":
      return "error";
    case "high":
      return "warning";
    case "medium":
      return "info";
    case "low":
    default:
      return "neutral";
  }
}

export * from "./types";
export * from "./approval-policy";
export * from "./approval-resolver";
export * from "./approval-validator";
export * from "./approval-history";
export * from "./approval-telemetry";
export * from "./approval-report";
export * from "./approval-engine";
export * from "./approval-service";
