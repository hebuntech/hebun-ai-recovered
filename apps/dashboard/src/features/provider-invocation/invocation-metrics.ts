/*
 * invocation-metrics.ts — deterministic headline metrics over the prepared
 * invocations, for the widget, summary tiles and director page.
 */

import type { BadgeVariant } from "@/components/ui/badge";
import { invocations } from "@/features/provider-invocation/invocation-engine";
import { validateInvocation } from "@/features/provider-invocation/invocation-validator";
import type { InvocationMetrics } from "@/features/provider-invocation/types";

const total = invocations.length;
const prepared = invocations.filter((i) => i.status === "Ready").length;
const simulation = invocations.filter((i) => i.simulation).length;
const failed = invocations.filter((i) => i.status === "Failed").length;
const withRetry = invocations.filter((i) => i.retryPolicy.maxAttempts > 1).length;
const withTimeout = invocations.filter((i) => i.timeoutPolicy.timeoutMs > 0).length;
const withAudit = invocations.filter((i) => i.audit.length > 0).length;
const validCount = invocations.filter((i) => validateInvocation(i).valid).length;

const invocationHealth = total === 0 ? 0 : Math.round((validCount / total) * 100);
const badge: BadgeVariant = invocationHealth >= 90 ? "success" : invocationHealth >= 75 ? "warning" : "error";

export const invocationMetrics: InvocationMetrics = {
  totalInvocations: total,
  preparedInvocations: prepared,
  simulationInvocations: simulation,
  failedInvocations: failed,
  retryCoverage: total === 0 ? 0 : Math.round((withRetry / total) * 100),
  timeoutCoverage: total === 0 ? 0 : Math.round((withTimeout / total) * 100),
  auditCoverage: total === 0 ? 0 : Math.round((withAudit / total) * 100),
  invocationHealth,
  badge,
};
