/*
 * execution-tokens.ts — token-driven class maps for the Execution Center.
 * Design tokens only (no hardcoded hex).
 */

import type { BadgeVariant } from "@/components/ui/badge";
import type {
  NodeState,
  ExecutionStatus,
  FailureClass,
  RecoveryKind,
} from "@/features/execution/mock";

export const nodeStateConfig: Record<NodeState, { label: string; dot: string; text: string; border: string }> = {
  pending: { label: "Pending", dot: "bg-fg-muted", text: "text-fg-muted", border: "border-border" },
  running: { label: "Running", dot: "bg-success", text: "text-success", border: "border-success/40" },
  waiting: { label: "Waiting", dot: "bg-info", text: "text-info", border: "border-info/40" },
  blocked: { label: "Blocked", dot: "bg-warning", text: "text-warning", border: "border-warning/40" },
  failed: { label: "Failed", dot: "bg-error", text: "text-error", border: "border-error/40" },
  retrying: { label: "Retrying", dot: "bg-warning", text: "text-warning", border: "border-warning/40" },
  completed: { label: "Completed", dot: "bg-fg-muted", text: "text-fg-secondary", border: "border-border" },
  cancelled: { label: "Cancelled", dot: "bg-fg-muted", text: "text-fg-muted", border: "border-border" },
};

export const execStatusConfig: Record<ExecutionStatus, { label: string; dot: string; text: string }> = {
  running: { label: "Running", dot: "bg-success", text: "text-success" },
  waiting: { label: "Waiting", dot: "bg-info", text: "text-info" },
  failed: { label: "Failed", dot: "bg-error", text: "text-error" },
  blocked: { label: "Blocked", dot: "bg-warning", text: "text-warning" },
  retrying: { label: "Retrying", dot: "bg-warning", text: "text-warning" },
  completed: { label: "Completed", dot: "bg-fg-muted", text: "text-fg-secondary" },
};

export const failureClassVariant: Record<FailureClass, BadgeVariant> = {
  infrastructure: "info",
  application: "warning",
  business: "primary",
  reasoning: "info",
  human: "warning",
};

export const failureClassLabel: Record<FailureClass, string> = {
  infrastructure: "Infrastructure",
  application: "Application",
  business: "Business",
  reasoning: "Reasoning",
  human: "Human",
};

export const recoveryLabel: Record<RecoveryKind, string> = {
  retry: "Retry",
  "fallback-model": "Fallback Model",
  "alternative-tool": "Alternative Tool",
  compensation: "Compensation",
  "human-escalation": "Human Escalation",
  "circuit-breaker": "Circuit Breaker",
};

export const escalationVariant: Record<"none" | "elevated" | "critical", BadgeVariant> = {
  none: "neutral",
  elevated: "warning",
  critical: "error",
};
