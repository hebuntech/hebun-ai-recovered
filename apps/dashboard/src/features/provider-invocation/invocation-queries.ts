/*
 * invocation-queries.ts — read-only query helpers over the invocation engine.
 * Pure lookups; no execution, no runtime provider invocation.
 */

import { invocations, invocationByRequestId, buildInvocation } from "@/features/provider-invocation/invocation-engine";
import { invocationReports, buildInvocationReport } from "@/features/provider-invocation/invocation-report";
import { invocationMetrics } from "@/features/provider-invocation/invocation-metrics";
import { validateInvocation } from "@/features/provider-invocation/invocation-validator";
import { invocationPipeline, supportedExecutionModes } from "@/features/provider-invocation/invocation-contract";
import { lifecycleStates, lifecycleTransitions } from "@/features/provider-invocation/invocation-lifecycle";
import type { RoutingDecision } from "@/features/provider-routing";

export function prepareInvocation(decision: RoutingDecision) {
  return buildInvocation(decision);
}

export function getInvocations() {
  return invocations;
}

export function getInvocation(requestId: string) {
  return invocationByRequestId(requestId);
}

export function getInvocationReport(requestId: string) {
  const inv = invocationByRequestId(requestId);
  return inv ? buildInvocationReport(inv) : undefined;
}

export function getInvocationReports() {
  return invocationReports;
}

export function getInvocationMetrics() {
  return invocationMetrics;
}

export function getInvocationValidation(requestId: string) {
  const inv = invocationByRequestId(requestId);
  return inv ? validateInvocation(inv) : undefined;
}

export function getInvocationPipeline() {
  return invocationPipeline;
}

export function getSupportedExecutionModes() {
  return supportedExecutionModes;
}

export function getLifecycle() {
  return { states: lifecycleStates, transitions: lifecycleTransitions };
}
