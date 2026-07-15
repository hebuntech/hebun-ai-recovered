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

export const COMMUNICATION_PROVIDER_ID = "communication";
export const COMMUNICATION_PROVIDER_NAME = "Communication";
export const COMMUNICATION_PROVIDER_FAMILY = "Hebun AI";

export type CommunicationCapabilityKind =
  | "email"
  | "calendar"
  | "meetings"
  | "messaging"
  | "notifications"
  | "contacts"
  | "tasks"
  | "invitations"
  | "reminders"
  | "announcements"
  | "broadcasts"
  | "conversation threads";

export interface CommunicationCapabilityMapping {
  communication: CommunicationCapabilityKind;
  framework: AdapterCapabilityKind;
  description: string;
}

export type CommunicationCredentialStatus =
  | "not-configured"
  | "placeholder"
  | "runtime-injected";

export interface CommunicationConfig extends ProviderConfig {
  defaultChannel: string;
  credentialStatus: CommunicationCredentialStatus;
}

export interface CommunicationRequest {
  requestId: string;
  email?: string;
  calendarEvent?: string;
  meeting?: string;
  message?: string;
  notification?: string;
  task?: string;
  thread?: string;
  metadata: Record<string, string>;
}

export interface CommunicationPlan {
  summary: string;
  channel: string;
  audience: string;
  approvalsRequired: boolean;
}

export interface CommunicationResponse {
  requestId: string;
  deliveryPlan: CommunicationPlan;
  calendarPlan: CommunicationPlan;
  meetingPlan: CommunicationPlan;
  messagePlan: CommunicationPlan;
  recipientSummary: string[];
  attachments: Array<{ label: string; kind: string }>;
  warnings: string[];
  events: AdapterEvent[];
  telemetry: ExecutionTelemetry;
  artifacts: ExecutionArtifact[];
}

export interface CommunicationSimulationProfile {
  capability: CommunicationCapabilityKind;
  deterministic: boolean;
  sampleRequest: CommunicationRequest;
  sampleResponse: CommunicationResponse;
  sampleFailure: AdapterError;
  expectedTelemetry: ExecutionTelemetry;
  expectedEvents: AdapterEvent[];
  normalizedRequest: NormalizedRequest;
  normalizedResponse: NormalizedResponse;
}

export interface CommunicationSafetyRule {
  label: string;
  summary: string;
}

export interface CommunicationMetrics {
  status: "simulation" | "ready" | "disabled";
  simulationMode: boolean;
  capabilityCoverage: number;
  conformanceScore: number;
  credentialStatus: CommunicationCredentialStatus;
  healthStatus: string;
  safetyStatus: string;
  healthBadge: BadgeVariant;
}
