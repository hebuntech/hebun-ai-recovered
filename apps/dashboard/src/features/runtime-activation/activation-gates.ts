import type {
  ActivationApprovalAssessment,
  ActivationCredentialAssessment,
  ActivationEnvironment,
  ActivationGateResult,
  ActivationPolicyAssessment,
  ActivationReadinessAssessment,
  ActivationRiskAssessment,
} from "@/features/runtime-activation/types";

export function evaluateActivationGates(input: {
  credentials: ActivationCredentialAssessment;
  environment: ActivationEnvironment;
  approval: ActivationApprovalAssessment;
  policy: ActivationPolicyAssessment;
  risk: ActivationRiskAssessment;
  readiness: ActivationReadinessAssessment;
  simulationFallback: boolean;
  emergencyDisabled: boolean;
}): ActivationGateResult[] {
  const {
    credentials,
    environment,
    approval,
    policy,
    risk,
    readiness,
    simulationFallback,
    emergencyDisabled,
  } = input;

  return [
    {
      gate: "Credential Gate",
      passed: !credentials.required || credentials.status === "Injected" || credentials.status === "Not Required",
      blocking: credentials.required,
      reason: credentials.note,
    },
    {
      gate: "Environment Gate",
      passed: environment.ready,
      blocking: true,
      reason: environment.note,
    },
    {
      gate: "Approval Gate",
      passed: approval.approved,
      blocking: approval.required,
      reason: approval.note,
    },
    {
      gate: "Policy Gate",
      passed: policy.status === "Allowed",
      blocking: policy.status === "Blocked" || policy.status === "Restricted",
      reason: policy.note,
    },
    {
      gate: "Risk Gate",
      passed: !risk.blocked,
      blocking: true,
      reason: risk.note,
    },
    {
      gate: "Readiness Gate",
      passed: readiness.ready,
      blocking: true,
      reason: readiness.summary,
    },
    {
      gate: "Simulation Gate",
      passed: simulationFallback,
      blocking: true,
      reason: simulationFallback ? "Simulation fallback is available." : "Simulation fallback is unavailable.",
    },
    {
      gate: "Emergency Gate",
      passed: !emergencyDisabled,
      blocking: true,
      reason: emergencyDisabled ? "Emergency stop posture disables activation." : "No emergency disable signal present.",
    },
  ];
}
