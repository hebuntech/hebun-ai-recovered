import type { BadgeVariant } from "@/components/ui/badge";
import type {
  AdapterCapabilityKind,
  AdapterError,
  AdapterEvent,
  ExecutionArtifact,
  ExecutionTelemetry,
} from "@/features/adapters";
import type {
  NormalizedRequest,
  NormalizedResponse,
  ProviderConfig,
} from "@/features/provider-framework";

export const COMPUTER_USE_PROVIDER_ID = "computer-use";
export const COMPUTER_USE_PROVIDER_NAME = "Computer Use";
export const COMPUTER_USE_PROVIDER_FAMILY = "Computer Use";

export type ComputerUseCapabilityKind =
  | "desktop inspection"
  | "application discovery"
  | "window discovery"
  | "window management planning"
  | "keyboard action planning"
  | "mouse action planning"
  | "clipboard planning"
  | "file interaction planning"
  | "application workflow planning"
  | "desktop workflow planning"
  | "multi-step execution planning"
  | "human confirmation checkpoints"
  | "tool invocation planning"
  | "session planning"
  | "environment inspection";

export interface ComputerUseCapabilityMapping {
  computerUse: ComputerUseCapabilityKind;
  framework: AdapterCapabilityKind;
  description: string;
}

export type ComputerUseCredentialStatus =
  | "not-configured"
  | "placeholder"
  | "runtime-injected";

export interface ComputerUseConfig extends ProviderConfig {
  defaultEnvironment: string;
  credentialStatus: ComputerUseCredentialStatus;
}

export type ComputerUseOutputFormat =
  | "plan"
  | "interaction-map"
  | "session-outline"
  | "workflow"
  | "structured-json";

export interface ComputerUseSessionPlan {
  id: string;
  mode: "read-only" | "safe" | "approval-gated";
  summary: string;
}

export interface ComputerUseRequest {
  requestId: string;
  task: string;
  environment: string;
  application?: string;
  window?: string;
  target?: string;
  constraints: string[];
  workflow: string[];
  session: ComputerUseSessionPlan;
  outputFormat: ComputerUseOutputFormat;
  metadata: Record<string, string>;
}

export interface ComputerUsePlannedAction {
  action: string;
  intent: string;
  confirmationRequired: boolean;
}

export interface ComputerUsePlannedApplication {
  name: string;
  role: string;
  availability: "assumed" | "planned" | "restricted";
}

export interface ComputerUsePlannedWindow {
  name: string;
  purpose: string;
  state: "foreground" | "background" | "planned";
}

export interface ComputerUsePlannedInteraction {
  type: "keyboard" | "mouse" | "window" | "tool" | "clipboard";
  summary: string;
  safetyLevel: "safe" | "review" | "restricted";
}

export interface ComputerUseConfirmation {
  gate: string;
  reason: string;
}

export interface ComputerUseRiskAssessment {
  level: "low" | "medium" | "high";
  summary: string;
  controls: string[];
}

export interface ComputerUseResponse {
  requestId: string;
  executionPlan: string;
  plannedActions: ComputerUsePlannedAction[];
  plannedApplications: ComputerUsePlannedApplication[];
  plannedWindows: ComputerUsePlannedWindow[];
  plannedInteractions: ComputerUsePlannedInteraction[];
  requiredConfirmations: ComputerUseConfirmation[];
  riskAssessment: ComputerUseRiskAssessment;
  warnings: string[];
  events: AdapterEvent[];
  telemetry: ExecutionTelemetry;
  artifacts: ExecutionArtifact[];
}

export type ComputerUseErrorCategory =
  | "validation"
  | "configuration"
  | "permission"
  | "timeout"
  | "application_not_found"
  | "window_not_found"
  | "unsafe_operation"
  | "unsupported_action"
  | "human_confirmation_required"
  | "execution"
  | "unknown";

export interface ComputerUseSimulationProfile {
  capability: ComputerUseCapabilityKind;
  deterministic: boolean;
  sampleRequest: ComputerUseRequest;
  sampleResponse: ComputerUseResponse;
  sampleFailure: AdapterError;
  expectedTelemetry: ExecutionTelemetry;
  expectedEvents: AdapterEvent[];
  normalizedRequest: NormalizedRequest;
  normalizedResponse: NormalizedResponse;
}

export interface ComputerUseSafetyRule {
  label: string;
  summary: string;
}

export interface ComputerUseMetrics {
  status: "simulation" | "ready" | "disabled";
  simulationMode: boolean;
  capabilityCoverage: number;
  conformanceScore: number;
  credentialStatus: ComputerUseCredentialStatus;
  healthStatus: string;
  safetyStatus: string;
  simulationReadiness: string;
  healthBadge: BadgeVariant;
}
