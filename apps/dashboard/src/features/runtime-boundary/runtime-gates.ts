/*
 * runtime-gates.ts — the nine deterministic runtime gates. Each gate inspects
 * one boundary assessment and returns pass/fail with a reason. Failed blocking
 * gates prevent an invocation from crossing into live runtime. In this phase the
 * Promotion Gate (live crossing) always fails by design.
 */

import type { RuntimeContext } from "@/features/runtime-boundary/runtime-context";
import type {
  ApprovalAssessment,
  CredentialAssessment,
  EnvironmentAssessment,
  PolicyAssessment,
  PromotionAssessment,
  ReadinessAssessment,
  RuntimeGateResult,
  RuntimeHealthAssessment,
} from "@/features/runtime-boundary/types";

export interface GateInputs {
  context: RuntimeContext;
  credential: CredentialAssessment;
  environment: EnvironmentAssessment;
  readiness: ReadinessAssessment;
  health: RuntimeHealthAssessment;
  approval: ApprovalAssessment;
  policy: PolicyAssessment;
  promotion: PromotionAssessment;
  emergencyStop?: boolean;
}

export function evaluateGates(inputs: GateInputs): RuntimeGateResult[] {
  const { context, credential, environment, readiness, health, approval, policy, promotion } = inputs;
  const emergencyStop = inputs.emergencyStop ?? false;
  const badCredential = credential.state === "Missing" || credential.state === "Invalid" || credential.state === "Expired";
  const crossingLive = context.runtimeMode === "Future Live";

  return [
    {
      gate: "Credential Gate",
      passed: !badCredential,
      blocking: true,
      reason: badCredential ? `Credentials ${credential.state}.` : credential.note,
    },
    {
      gate: "Environment Gate",
      passed: environment.ready,
      blocking: true,
      reason: environment.note,
    },
    {
      gate: "Policy Gate",
      passed: policy.status !== "blocked",
      blocking: true,
      reason: policy.note,
    },
    {
      gate: "Approval Gate",
      passed: !approval.required,
      blocking: true,
      reason: approval.reason,
    },
    {
      gate: "Health Gate",
      passed: health.healthy,
      blocking: true,
      reason: `Runtime health ${health.score}.`,
    },
    {
      gate: "Provider Gate",
      passed: readiness.ready,
      blocking: true,
      reason: readiness.ready ? "Provider ready." : "Provider not ready.",
    },
    {
      gate: "Simulation Gate",
      passed: context.simulation || context.runtimeMode !== "Blocked",
      blocking: false,
      reason: "Simulation fallback is always available.",
    },
    {
      gate: "Promotion Gate",
      passed: !crossingLive,
      blocking: true,
      reason: crossingLive
        ? "Live runtime crossing is disabled in this phase."
        : promotion.reason,
    },
    {
      gate: "Emergency Stop Gate",
      passed: !emergencyStop,
      blocking: true,
      reason: emergencyStop ? "Emergency stop engaged." : "Emergency stop not engaged.",
    },
  ];
}
