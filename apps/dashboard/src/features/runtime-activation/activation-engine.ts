import type { BadgeVariant } from "@/components/ui/badge";
import { runtimeDecisions } from "@/features/runtime-boundary";
import type { RuntimeDecision } from "@/features/runtime-boundary";
import { buildActivationContext } from "@/features/runtime-activation/activation-context";
import { assessActivationEnvironment } from "@/features/runtime-activation/activation-environment";
import { assessActivationCredentials } from "@/features/runtime-activation/activation-credentials";
import { assessActivationPolicy } from "@/features/runtime-activation/activation-policy";
import { assessActivationApproval } from "@/features/runtime-activation/activation-approval";
import { assessActivationRisk } from "@/features/runtime-activation/activation-risk";
import { assessActivationReadiness } from "@/features/runtime-activation/activation-readiness";
import { evaluateActivationGates } from "@/features/runtime-activation/activation-gates";
import { buildActivationAudit } from "@/features/runtime-activation/activation-audit";
import { buildActivationEvents } from "@/features/runtime-activation/activation-events";
import { buildActivationReport } from "@/features/runtime-activation/activation-report";
import type { ActivationDecision, ActivationLevel } from "@/features/runtime-activation/types";

const EPOCH = "2025-01-01T00:00:00.000Z";

function badgeFor(level: ActivationLevel): BadgeVariant {
  if (level === "Live Enabled" || level === "Ready For Live") return "success";
  if (level === "Dry Run" || level === "Read Only" || level === "Simulation") return "warning";
  return "error";
}

function determineActivationLevel(
  runtimeDecision: RuntimeDecision,
  blockReasons: string[],
  gatesPassed: boolean,
  readinessScore: number,
  credentialsLiveEligible: boolean,
  policyAllowsLive: boolean,
  approvalApproved: boolean,
  riskBlocked: boolean
): ActivationLevel {
  if (runtimeDecision.runtimeMode === "Emergency Stop") return "Emergency Disabled";
  if (!gatesPassed || blockReasons.length > 0) return "Blocked";
  if (
    runtimeDecision.runtimeMode === "Future Live" &&
    readinessScore >= 90 &&
    credentialsLiveEligible &&
    policyAllowsLive &&
    approvalApproved &&
    !riskBlocked
  ) {
    return "Ready For Live";
  }
  if (runtimeDecision.runtimeMode === "Read Only") return "Read Only";
  if (runtimeDecision.runtimeMode === "Dry Run" || runtimeDecision.runtimeMode === "Approval Required") {
    return "Dry Run";
  }
  return "Simulation";
}

export function evaluateActivation(runtimeDecision: RuntimeDecision): ActivationDecision {
  const context = buildActivationContext(runtimeDecision);
  const environment = assessActivationEnvironment(runtimeDecision);
  const credentials = assessActivationCredentials(runtimeDecision);
  const policy = assessActivationPolicy(runtimeDecision);
  const approval = assessActivationApproval(runtimeDecision);
  const risk = assessActivationRisk(runtimeDecision);
  const readiness = assessActivationReadiness(runtimeDecision, policy, approval, risk);
  const emergencyDisabled = runtimeDecision.runtimeMode === "Emergency Stop";
  const gates = evaluateActivationGates({
    credentials,
    environment,
    approval,
    policy,
    risk,
    readiness,
    simulationFallback: runtimeDecision.simulationFallback,
    emergencyDisabled,
  });
  const blockingFailures = gates.filter((gate) => gate.blocking && !gate.passed);
  const blockReasons = blockingFailures.map((gate) => `${gate.gate}: ${gate.reason}`);
  const activationLevel = determineActivationLevel(
    runtimeDecision,
    blockReasons,
    blockingFailures.length === 0,
    readiness.score,
    credentials.liveEligible,
    policy.allowsLive,
    approval.approved,
    risk.blocked
  );
  const blocked = activationLevel === "Blocked" || activationLevel === "Emergency Disabled";
  const allowed = !blocked;
  const explanation = blocked
    ? `Activation is held at the deterministic boundary. ${blockReasons[0] ?? "Live activation conditions are not satisfied."}`
    : activationLevel === "Ready For Live"
      ? "The runtime is structurally ready for a future live promotion review, but live execution remains disabled in this phase."
      : `Activation is allowed in ${activationLevel} mode while remaining provider-independent and offline-safe.`;

  const partialDecision = {
    id: `act-${runtimeDecision.requestId}`,
    runtimeDecisionId: runtimeDecision.id,
    providerId: runtimeDecision.providerId,
    providerType: runtimeDecision.providerType,
    activationLevel,
    allowed,
    blocked,
    blockReasons,
    credentialStatus: credentials.status,
    approvalStatus: approval.status,
    policyStatus: policy.status,
    riskLevel: risk.level,
    environmentStatus: environment.status,
    readinessScore: readiness.score,
    simulationFallback: runtimeDecision.simulationFallback,
    telemetry: {
      gateCount: gates.length,
      passedGates: gates.filter((gate) => gate.passed).length,
      failedGates: gates.filter((gate) => !gate.passed).length,
      readinessScore: readiness.score,
      riskScore: risk.score,
      liveEligible: activationLevel === "Ready For Live" || activationLevel === "Live Enabled",
      simulationFallback: runtimeDecision.simulationFallback,
    },
    timestamp: EPOCH,
    context,
    environment,
    credentials,
    policy,
    approval,
    risk,
    readiness,
    gates,
    explanation,
    badge: badgeFor(activationLevel),
  };

  const audit = buildActivationAudit({ decision: partialDecision, gates });
  const events = buildActivationEvents({ decision: partialDecision, gates });
  const report = buildActivationReport({ ...partialDecision, audit, events });

  return {
    ...partialDecision,
    audit,
    events,
    report,
  };
}

export const activationDecisions = runtimeDecisions.map(evaluateActivation);

export function getActivationDecisionByRuntimeDecisionId(runtimeDecisionId: string) {
  return activationDecisions.find((decision) => decision.runtimeDecisionId === runtimeDecisionId);
}
