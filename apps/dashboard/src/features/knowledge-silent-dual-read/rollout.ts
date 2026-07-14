import {
  isDeterministicallySampled,
  rolloutRateToPercentage,
} from "@/features/canonical-read-platform";
import type {
  KnowledgeSilentDualReadRolloutDiagnosticsView,
  KnowledgeSilentDualReadRolloutEvaluation,
  KnowledgeSilentDualReadRolloutEvaluationInput,
} from "./types";

export function evaluateKnowledgeSilentDualReadRollout(
  input: KnowledgeSilentDualReadRolloutEvaluationInput,
): KnowledgeSilentDualReadRolloutEvaluation {
  if (!input.config.valid) {
    return {
      enabled: false,
      sampled: false,
      tenantEligible: false,
      shouldRun: false,
      reason: "invalid-config",
    };
  }

  if (input.config.killSwitchActive) {
    return {
      enabled: false,
      sampled: false,
      tenantEligible: false,
      shouldRun: false,
      reason: "kill-switch-active",
    };
  }

  if (!input.config.requestedEnabled) {
    return {
      enabled: false,
      sampled: false,
      tenantEligible: false,
      shouldRun: false,
      reason: "feature-disabled",
    };
  }

  const tenantId = input.tenantId?.trim();
  if (!tenantId) {
    return {
      enabled: false,
      sampled: false,
      tenantEligible: false,
      shouldRun: false,
      reason: "missing-tenant",
    };
  }

  const tenantEligible = input.config.allowlistedTenants.has(tenantId);
  if (!tenantEligible) {
    return {
      enabled: true,
      sampled: false,
      tenantEligible,
      shouldRun: false,
      reason: "tenant-not-allowed",
    };
  }

  const sampleKey = input.requestSampleKey?.trim();
  if (!sampleKey) {
    return {
      enabled: true,
      sampled: false,
      tenantEligible,
      shouldRun: false,
      reason: "missing-sample-key",
    };
  }

  const sampled = isDeterministicallySampled(sampleKey, input.config.sampleRate);
  if (!sampled) {
    return {
      enabled: true,
      sampled: false,
      tenantEligible,
      shouldRun: false,
      reason: "sample-excluded",
    };
  }

  return {
    enabled: true,
    sampled,
    tenantEligible,
    shouldRun: true,
  };
}

export function summarizeKnowledgeSilentDualReadRolloutForDiagnostics(input: {
  readonly config: KnowledgeSilentDualReadRolloutEvaluationInput["config"];
  readonly tenantId?: string | null;
  readonly requestSampleKey?: string | null;
}): KnowledgeSilentDualReadRolloutDiagnosticsView {
  const tenantProvided = Boolean(input.tenantId?.trim());
  const rollout = evaluateKnowledgeSilentDualReadRollout(input);

  return {
    enabled: rollout.shouldRun,
    disabled: !rollout.shouldRun,
    samplePercentage: rolloutRateToPercentage(input.config.sampleRate),
    tenantEligible: tenantProvided ? rollout.tenantEligible : null,
    killSwitchActive: input.config.killSwitchActive,
    reason: rollout.reason,
  };
}
