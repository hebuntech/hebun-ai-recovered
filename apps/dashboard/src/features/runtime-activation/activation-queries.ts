import { runtimeDecisions } from "@/features/runtime-boundary";
import {
  activationDecisions,
  getActivationDecisionByRuntimeDecisionId,
} from "@/features/runtime-activation/activation-engine";
import { activationMetrics } from "@/features/runtime-activation/activation-metrics";
import {
  activationFrameworkClauses,
  activationGateKinds,
  activationLevels,
  activationPipeline,
} from "@/features/runtime-activation/activation-pipeline";
import { validateActivationDecision } from "@/features/runtime-activation/activation-validator";

export function getActivationDecisions() {
  return activationDecisions;
}

export function getActivationDecision(runtimeDecisionId: string) {
  return getActivationDecisionByRuntimeDecisionId(runtimeDecisionId);
}

export function getActivationReport(runtimeDecisionId: string) {
  return getActivationDecisionByRuntimeDecisionId(runtimeDecisionId)?.report;
}

export function getActivationMetrics() {
  return activationMetrics;
}

export function getActivationPipeline() {
  return activationPipeline;
}

export function getActivationLevels() {
  return activationLevels;
}

export function getActivationGateKinds() {
  return activationGateKinds;
}

export function getActivationClauses() {
  return activationFrameworkClauses;
}

export function getActivationValidations() {
  return activationDecisions.map((decision) => ({
    decisionId: decision.id,
    ...validateActivationDecision(decision),
  }));
}

export function getActivationCoverage() {
  return {
    runtimeDecisions: runtimeDecisions.length,
    activationDecisions: activationDecisions.length,
  };
}
