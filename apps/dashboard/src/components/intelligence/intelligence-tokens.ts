/*
 * intelligence-tokens.ts — token-driven class maps for the Intelligence Center.
 * Design tokens only (no hardcoded hex).
 */

import type { BadgeVariant } from "@/components/ui/badge";
import type { Trend, PatternStatus, ForecastKind, Improvement, TrendItem } from "@/features/intelligence/mock";

export const patternStatusVariant: Record<PatternStatus, BadgeVariant> = {
  emerging: "info",
  confirmed: "warning",
  monitoring: "neutral",
  actioned: "success",
};

export const levelVariant: Record<TrendItem["level"], BadgeVariant> = {
  low: "success",
  medium: "info",
  high: "warning",
  critical: "error",
};

export const improvementVariant: Record<Improvement["status"], BadgeVariant> = {
  adopted: "success",
  experimenting: "info",
  rolled_back: "warning",
  rejected: "error",
};

export const forecastTone: Record<ForecastKind, string> = {
  capacity: "text-warning",
  cost: "text-accent",
  performance: "text-success",
  learning: "text-highlight",
};

/* trend arrow tone — context aware:
 * for risk, "up" is bad; for opportunity/perf, "up" is good.
 */
export function trendTone(trend: Trend, upIsGood = true): string {
  if (trend === "flat") return "text-fg-muted";
  const good = upIsGood ? trend === "up" : trend === "down";
  return good ? "text-success" : "text-error";
}
