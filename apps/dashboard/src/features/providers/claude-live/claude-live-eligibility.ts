import { claudeProvider } from "@/features/providers/claude";
import { getActivationDecisions } from "@/features/runtime-activation";
import { getRuntimeDecisions } from "@/features/runtime-boundary";
import { invocations } from "@/features/provider-invocation";
import { routingDecisions } from "@/features/provider-routing";
import { claudeLiveConfig } from "@/features/providers/claude-live/claude-live-config";
import type {
  ClaudeLiveEligibility,
  ClaudeLiveEligibilityCheck,
  ClaudeLiveReferenceChain,
} from "@/features/providers/claude-live/types";

export function getClaudeLiveReferenceChain(): ClaudeLiveReferenceChain {
  const invocation = invocations.find((item) => item.providerId === "claude") ?? null;
  const routing = invocation
    ? routingDecisions.find((item) => item.id === invocation.routingDecisionId) ?? null
    : routingDecisions.find((item) => item.primaryProvider === "claude") ?? null;
  const runtime = invocation
    ? getRuntimeDecisions().find((item) => item.requestId === invocation.requestId) ?? null
    : null;
  const activation = runtime
    ? getActivationDecisions().find((item) => item.runtimeDecisionId === runtime.id) ?? null
    : null;

  return {
    providerId: "claude",
    providerType: claudeProvider.providerType,
    routingDecisionId: routing?.id ?? null,
    invocationId: invocation?.id ?? null,
    runtimeDecisionId: runtime?.id ?? null,
    activationDecisionId: activation?.id ?? null,
    requestId: invocation?.requestId ?? routing?.requestId ?? null,
  };
}

export function evaluateClaudeLiveEligibility(): ClaudeLiveEligibility {
  const chain = getClaudeLiveReferenceChain();
  const runtime = chain.runtimeDecisionId
    ? getRuntimeDecisions().find((item) => item.id === chain.runtimeDecisionId) ?? null
    : null;
  const activation = chain.activationDecisionId
    ? getActivationDecisions().find((item) => item.id === chain.activationDecisionId) ?? null
    : null;

  const checks: ClaudeLiveEligibilityCheck[] = [
    {
      label: "Runtime Boundary allows provider crossing",
      passed: Boolean(runtime?.allowed),
      blocking: true,
      detail: runtime?.explanation ?? "No runtime decision is linked.",
    },
    {
      label: "Runtime Activation returns Live Enabled",
      passed: activation?.activationLevel === "Live Enabled",
      blocking: true,
      detail: activation
        ? `Activation level is ${activation.activationLevel}.`
        : "No activation decision is linked.",
    },
    {
      label: "Capability is allowlisted",
      passed: claudeLiveConfig.supportedCapabilities.includes("summarization"),
      blocking: true,
      detail: "Only summarization is allowlisted in this phase.",
    },
    {
      label: "Credential status is Injected",
      passed: claudeLiveConfig.credentialStatus === "Injected",
      blocking: true,
      detail: `Credential status is ${claudeLiveConfig.credentialStatus}.`,
    },
    {
      label: "Environment is not Offline",
      passed: activation?.environmentStatus !== "Offline",
      blocking: true,
      detail: activation
        ? `Activation environment is ${activation.environmentStatus}.`
        : "No activation environment is linked.",
    },
    {
      label: "Policy allows live execution",
      passed: activation?.policyStatus === "Allowed",
      blocking: true,
      detail: activation ? `Policy status is ${activation.policyStatus}.` : "No policy status is linked.",
    },
    {
      label: "Approval gate is satisfied",
      passed: activation?.approvalStatus === "Approved" || activation?.approvalStatus === "Not Required",
      blocking: true,
      detail: activation
        ? `Approval status is ${activation.approvalStatus}.`
        : "No approval status is linked.",
    },
    {
      label: "Simulation fallback exists",
      passed: claudeLiveConfig.simulationFallbackRequired && Boolean(activation?.simulationFallback ?? true),
      blocking: true,
      detail: "Simulation fallback remains mandatory for every Claude live attempt.",
    },
    {
      label: "Audit trail is enabled",
      passed: claudeLiveConfig.auditTrailEnabled,
      blocking: true,
      detail: "Audit trail is always enabled in this phase.",
    },
  ];

  const reasons = checks.filter((check) => check.blocking && !check.passed).map((check) => `${check.label}: ${check.detail}`);
  const liveEligible = reasons.length === 0;

  return {
    mode: liveEligible ? "Live Eligible" : "Live Blocked",
    liveEligible,
    activationLevel: activation?.activationLevel ?? null,
    credentialStatus: claudeLiveConfig.credentialStatus,
    reasons,
    checks,
  };
}
