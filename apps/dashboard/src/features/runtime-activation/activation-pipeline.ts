export interface ActivationPipelineStep {
  order: number;
  label: string;
  description: string;
}

export const activationPipeline: ActivationPipelineStep[] = [
  { order: 1, label: "Receive Runtime Decision", description: "Accept the upstream runtime-boundary decision." },
  { order: 2, label: "Resolve Activation Context", description: "Reference provider, mode, confidence and fallback state." },
  { order: 3, label: "Validate Environment", description: "Assess deterministic environment descriptors only." },
  { order: 4, label: "Validate Credentials", description: "Inspect placeholder credential status without loading secrets." },
  { order: 5, label: "Validate Policy", description: "Reference policy posture from the runtime boundary." },
  { order: 6, label: "Validate Approval", description: "Determine whether approval is required or pending." },
  { order: 7, label: "Evaluate Risk", description: "Interpret activation risk from upstream readiness and block state." },
  { order: 8, label: "Evaluate Readiness", description: "Score provider, runtime, configuration, policy and simulation readiness." },
  { order: 9, label: "Determine Activation Level", description: "Resolve the highest safe activation level deterministically." },
  { order: 10, label: "Generate Activation Decision", description: "Assemble the final provider-independent activation decision." },
  { order: 11, label: "Generate Audit", description: "Emit traceable activation audit records." },
  { order: 12, label: "Generate Report", description: "Publish a human-readable activation report." },
];

export const activationLevels = [
  "Simulation",
  "Dry Run",
  "Read Only",
  "Ready For Live",
  "Live Enabled",
  "Blocked",
  "Emergency Disabled",
] as const;

export const activationGateKinds = [
  "Credential Gate",
  "Environment Gate",
  "Approval Gate",
  "Policy Gate",
  "Risk Gate",
  "Readiness Gate",
  "Simulation Gate",
  "Emergency Gate",
] as const;

export const activationFrameworkClauses: string[] = [
  "Runtime Activation decides whether a provider may leave simulation-oriented execution modes; it never executes the provider.",
  "Credentials remain placeholder-only in this phase; no env vars, secret managers or external systems are accessed.",
  "Live Enabled exists in the model but is not reached by the current offline architecture.",
  "All activation outcomes are derived from existing runtime-boundary and provider metadata references.",
  "Simulation fallback remains available for every blocked or not-live-ready decision.",
];
