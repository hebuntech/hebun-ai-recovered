/*
 * runtime-metrics.ts — deterministic headline metrics over the runtime
 * decisions, for the widget, summary tiles and director page.
 */

import type { BadgeVariant } from "@/components/ui/badge";
import { runtimeDecisions } from "@/features/runtime-boundary/runtime-engine";
import { validateRuntimeDecision } from "@/features/runtime-boundary/runtime-validator";
import type { RuntimeMetrics } from "@/features/runtime-boundary/types";

const total = runtimeDecisions.length;
const validCount = runtimeDecisions.filter((d) => validateRuntimeDecision(d).valid).length;
const simulation = runtimeDecisions.filter((d) => d.simulationFallback).length;
const promotable = runtimeDecisions.filter((d) => d.promotion.eligible).length;
const blocked = runtimeDecisions.filter((d) => d.blocked).length;
const approvalQueue = runtimeDecisions.filter((d) => d.approvalRequired).length;
const credentialPlaceholders = runtimeDecisions.filter((d) => d.credential.state === "Placeholder").length;
const liveCrossings = runtimeDecisions.filter((d) => d.allowed && d.runtimeMode === "Future Live").length;

const runtimeHealth = total === 0 ? 0 : Math.round((validCount / total) * 100);
const badge: BadgeVariant = runtimeHealth >= 90 ? "success" : runtimeHealth >= 75 ? "warning" : "error";

export const runtimeMetrics: RuntimeMetrics = {
  totalDecisions: total,
  runtimeHealth,
  simulationCoverage: total === 0 ? 0 : Math.round((simulation / total) * 100),
  promotionReadiness: total === 0 ? 0 : Math.round((promotable / total) * 100),
  blockedInvocations: blocked,
  approvalQueue,
  credentialPlaceholders,
  liveCrossings,
  badge,
};
