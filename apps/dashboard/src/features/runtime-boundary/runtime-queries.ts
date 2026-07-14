/*
 * runtime-queries.ts — read-only query helpers over the runtime boundary. Pure
 * lookups; no execution, no runtime provider invocation.
 */

import type { Invocation } from "@/features/provider-invocation";
import { evaluate, runtimeDecisions, runtimeDecisionByRequestId } from "@/features/runtime-boundary/runtime-engine";
import { runtimeReports, buildRuntimeReport } from "@/features/runtime-boundary/runtime-report";
import { runtimeMetrics } from "@/features/runtime-boundary/runtime-metrics";
import { validateRuntimeDecision } from "@/features/runtime-boundary/runtime-validator";
import { runtimePipeline, runtimeModes, runtimeGateKinds } from "@/features/runtime-boundary/runtime-boundary";
import { runtimeStates } from "@/features/runtime-boundary/runtime-state";

export function evaluateInvocation(inv: Invocation) {
  return evaluate(inv);
}

export function getRuntimeDecisions() {
  return runtimeDecisions;
}

export function getRuntimeDecision(requestId: string) {
  return runtimeDecisionByRequestId(requestId);
}

export function getRuntimeReport(requestId: string) {
  const d = runtimeDecisionByRequestId(requestId);
  return d ? buildRuntimeReport(d) : undefined;
}

export function getRuntimeReports() {
  return runtimeReports;
}

export function getRuntimeMetrics() {
  return runtimeMetrics;
}

export function getRuntimeValidation(requestId: string) {
  const d = runtimeDecisionByRequestId(requestId);
  return d ? validateRuntimeDecision(d) : undefined;
}

export function getRuntimePipeline() {
  return runtimePipeline;
}

export function getRuntimeModes() {
  return runtimeModes;
}

export function getRuntimeGateKinds() {
  return runtimeGateKinds;
}

export function getRuntimeStates() {
  return runtimeStates;
}
