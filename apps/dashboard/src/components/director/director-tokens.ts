/*
 * director-tokens.ts — token-driven class maps for the Director Command Center.
 * All values resolve to design tokens (no hardcoded hex/px in components).
 */

import type { BadgeVariant } from "@/components/ui/badge";
import type {
  Priority,
  GoalStatus,
  RiskLevel,
  InsightKind,
  ApprovalStatus,
  Escalation,
  AlertCategory,
} from "@/features/director/mock";

export const priorityVariant: Record<Priority, BadgeVariant> = {
  critical: "error",
  high: "warning",
  medium: "info",
  low: "neutral",
};

export const goalStatusVariant: Record<GoalStatus, BadgeVariant> = {
  "on-track": "success",
  "at-risk": "warning",
  blocked: "error",
  achieved: "primary",
};

export const riskVariant: Record<RiskLevel, BadgeVariant> = {
  low: "success",
  medium: "info",
  high: "warning",
  critical: "error",
};

export const approvalVariant: Record<ApprovalStatus, BadgeVariant> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

export const escalationVariant: Record<Escalation, BadgeVariant> = {
  monitor: "info",
  elevated: "warning",
  critical: "error",
};

export const insightTone: Record<InsightKind, string> = {
  opportunity: "text-success",
  risk: "text-error",
  attention: "text-warning",
  cost: "text-accent",
  learning: "text-highlight",
};

export const insightLabel: Record<InsightKind, string> = {
  opportunity: "Opportunity",
  risk: "Risk",
  attention: "Attention",
  cost: "Cost",
  learning: "Learning",
};

export const alertCategoryLabel: Record<AlertCategory, string> = {
  incident: "Incident",
  risk: "Risk",
  compliance: "Compliance",
  infrastructure: "Infrastructure",
  approval: "Approval",
  workflow: "Workflow",
  security: "Security",
};

/** progress bar fill tone by percentage */
export function progressTone(pct: number): string {
  if (pct >= 80) return "bg-success";
  if (pct >= 50) return "bg-info";
  if (pct >= 30) return "bg-warning";
  return "bg-error";
}
