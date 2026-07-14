import type { BadgeVariant } from "@/components/ui/badge";
import type {
  GovernancePriority,
  GovernanceStatus,
  GovernanceTrend,
} from "@/features/governance/types";

export const governancePriorityVariant: Record<GovernancePriority, BadgeVariant> = {
  critical: "error",
  high: "warning",
  medium: "info",
  low: "neutral",
};

export const governanceStatusVariant: Record<GovernanceStatus, BadgeVariant> = {
  active: "success",
  draft: "neutral",
  review: "warning",
  deprecated: "error",
};

export function governanceTrendTone(trend: GovernanceTrend): string {
  if (trend === "up") return "text-success";
  if (trend === "down") return "text-error";
  return "text-fg-muted";
}

export function accessTone(access: "allow" | "review" | "deny"): string {
  if (access === "allow") return "text-success";
  if (access === "review") return "text-warning";
  return "text-error";
}
