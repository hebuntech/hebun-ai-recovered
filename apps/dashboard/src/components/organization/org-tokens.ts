/*
 * org-tokens.ts — token-driven class maps for the Live Organization View.
 * Design tokens only (no hardcoded hex).
 */

import type { BadgeVariant } from "@/components/ui/badge";
import type { OrgStatus, Workload, AgentStatus } from "@/features/organization/mock";

export const orgStatusVariant: Record<OrgStatus, BadgeVariant> = {
  online: "success",
  degraded: "warning",
  offline: "error",
};

export const agentStatusConfig: Record<AgentStatus, { label: string; dot: string; text: string }> = {
  running: { label: "Running", dot: "bg-success", text: "text-success" },
  idle: { label: "Idle", dot: "bg-fg-muted", text: "text-fg-secondary" },
  paused: { label: "Paused", dot: "bg-warning", text: "text-warning" },
  error: { label: "Error", dot: "bg-error", text: "text-error" },
};

/** heatmap cell tone by workload — token colors only */
export const workloadCell: Record<Workload, { bg: string; text: string; label: string }> = {
  idle: { bg: "bg-surface-sunken", text: "text-fg-muted", label: "Idle" },
  low: { bg: "bg-info/15", text: "text-info", label: "Low" },
  medium: { bg: "bg-success/15", text: "text-success", label: "Medium" },
  high: { bg: "bg-warning/20", text: "text-warning", label: "High" },
  critical: { bg: "bg-error/20", text: "text-error", label: "Critical" },
};

export function healthTone(v: number): string {
  if (v >= 90) return "text-success";
  if (v >= 80) return "text-info";
  if (v >= 70) return "text-warning";
  return "text-error";
}

/** matrix score cell (risk inverted: lower = better) */
export function scoreTone(v: number, inverted = false): string {
  const s = inverted ? 100 - v : v;
  if (s >= 85) return "text-success";
  if (s >= 70) return "text-info";
  if (s >= 55) return "text-warning";
  return "text-error";
}
