/*
 * confidence-engine.ts — deterministic routing confidence. Blends capability,
 * health and policy scores into a single 0–100 confidence value with fixed
 * weights. Fully explainable, no randomness.
 */

import type { BadgeVariant } from "@/components/ui/badge";

export const CONFIDENCE_WEIGHTS = { capability: 0.5, health: 0.3, policy: 0.2 } as const;

export function computeConfidence(capability: number, health: number, policy: number): number {
  return Math.round(
    capability * CONFIDENCE_WEIGHTS.capability +
      health * CONFIDENCE_WEIGHTS.health +
      policy * CONFIDENCE_WEIGHTS.policy
  );
}

export function confidenceBadge(confidence: number): BadgeVariant {
  return confidence >= 75 ? "success" : confidence >= 50 ? "warning" : "error";
}

export function riskLevel(confidence: number): "low" | "medium" | "high" {
  return confidence >= 75 ? "low" : confidence >= 50 ? "medium" : "high";
}

export function riskBadge(level: "low" | "medium" | "high"): BadgeVariant {
  return level === "low" ? "success" : level === "medium" ? "warning" : "error";
}
