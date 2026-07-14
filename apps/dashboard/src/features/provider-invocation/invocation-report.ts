/*
 * invocation-report.ts — explainable, auditable per-invocation report.
 */

import { validateInvocation } from "@/features/provider-invocation/invocation-validator";
import { lifecycleBadge } from "@/features/provider-invocation/invocation-lifecycle";
import { invocations } from "@/features/provider-invocation/invocation-engine";
import type { Invocation, InvocationReport } from "@/features/provider-invocation/types";

export function buildInvocationReport(inv: Invocation): InvocationReport {
  const validation = validateInvocation(inv);
  return {
    invocationId: inv.id,
    requestId: inv.requestId,
    providerId: inv.providerId,
    executionMode: inv.executionMode,
    status: inv.status,
    simulation: inv.simulation,
    retries: inv.retryPolicy.maxAttempts,
    timeoutMs: inv.timeoutPolicy.timeoutMs,
    rollback: inv.rollbackPolicy.enabled,
    cancellable: inv.cancellationPolicy.cancellable,
    artifactCount: inv.artifacts.length,
    auditCount: inv.audit.length,
    explanation: inv.explanation,
    valid: validation.valid,
    badge: lifecycleBadge(inv.status),
  };
}

export const invocationReports: InvocationReport[] = invocations.map(buildInvocationReport);
