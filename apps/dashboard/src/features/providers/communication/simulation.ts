import { makeAdapterError, makeEvent } from "@/features/adapters";
import type { AdapterEvent, ExecutionTelemetry } from "@/features/adapters";
import type { NormalizedRequest, NormalizedResponse } from "@/features/provider-framework";
import { communicationProviderEvents } from "@/features/providers/communication/events";
import { communicationProviderTelemetry } from "@/features/providers/communication/telemetry";
import type {
  CommunicationRequest,
  CommunicationResponse,
  CommunicationSimulationProfile,
  CommunicationCapabilityKind,
  CommunicationSafetyRule,
} from "@/features/providers/communication/types";

const capabilitySamples: Array<{
  capability: CommunicationCapabilityKind;
  requestKey: keyof CommunicationRequest;
  value: string;
  summary: string;
  audience: string;
  channel: string;
  warning?: string;
}> = [
  { capability: "email", requestKey: "email", value: "director-weekly@simulation.local", summary: "Prepared a deterministic executive email delivery plan with audience, review, and approval posture.", audience: "Executive Leadership", channel: "executive-email" },
  { capability: "calendar", requestKey: "calendarEvent", value: "Q3 Strategy Review", summary: "Prepared a deterministic calendar planning artifact with timing and conflict posture.", audience: "Leadership Calendar", channel: "calendar-planning" },
  { capability: "meetings", requestKey: "meeting", value: "Operations Alignment", summary: "Prepared a deterministic meeting plan including agenda posture and invite approval gates.", audience: "Operations Leaders", channel: "meeting-coordination" },
  { capability: "messaging", requestKey: "message", value: "Policy update draft", summary: "Prepared a deterministic messaging plan with channel guidance and escalation notes.", audience: "Policy Team", channel: "internal-messaging" },
  { capability: "notifications", requestKey: "notification", value: "Critical approval pending", summary: "Prepared a deterministic notification plan with urgency, audience, and cadence.", audience: "Approvers", channel: "notification-stream" },
  { capability: "reminders", requestKey: "task", value: "Review pending recommendation", summary: "Prepared a deterministic reminder plan with follow-up timing and acknowledgment expectations.", audience: "Assigned Reviewers", channel: "reminder-flow" },
  { capability: "tasks", requestKey: "task", value: "Assign compliance follow-up", summary: "Prepared a deterministic task-assignment communication plan for accountable owners.", audience: "Compliance Owners", channel: "task-assignment" },
  { capability: "invitations", requestKey: "meeting", value: "Board Preparation Session", summary: "Prepared a deterministic invitation plan with attendee grouping and approval checkpoints.", audience: "Board Support Team", channel: "invitation-planning" },
  { capability: "announcements", requestKey: "message", value: "Operating model update", summary: "Prepared a deterministic announcement plan for internal broadcast readiness.", audience: "All Departments", channel: "internal-announcement" },
  { capability: "conversation threads", requestKey: "thread", value: "Director planning thread", summary: "Prepared a deterministic conversation summary and reply-planning artifact.", audience: "Director Office", channel: "thread-summary", warning: "Conversation summary is simulated and does not reflect real communication history." },
];

export const communicationSafetyRules: CommunicationSafetyRule[] = [
  { label: "Approval Required", summary: "Sensitive future communications should remain blocked behind explicit approval steps." },
  { label: "Confidential Communication", summary: "Confidential messages should be classified and reviewed before any future delivery." },
  { label: "External Communication", summary: "External audiences should remain separated from internal-only planning flows." },
  { label: "Internal Communication", summary: "Internal communication plans should still respect policy and recipient controls." },
  { label: "Restricted Recipients", summary: "Certain future recipients should require policy checks before any delivery decision." },
  { label: "Sensitive Data", summary: "Sensitive content should remain summarized and approval-gated in all planning outputs." },
  { label: "Simulation Mode", summary: "All current outputs are deterministic plans and fixtures only, never live sends or scheduling." },
];

function telemetryFor(capability: CommunicationCapabilityKind): ExecutionTelemetry {
  const base =
    communicationProviderTelemetry.executions +
    capabilitySamples.findIndex((item) => item.capability === capability);
  return {
    ...communicationProviderTelemetry,
    executions: base,
    lastUpdated: "11:35",
  };
}

function eventsFor(capability: CommunicationCapabilityKind): AdapterEvent[] {
  return [
    ...communicationProviderEvents,
    makeEvent(
      "Execution Completed",
      "communication-provider-simulation",
      `Deterministic Communication simulation completed for ${capability}.`,
      "11:35"
    ),
  ];
}

function buildProfile(
  sample: (typeof capabilitySamples)[number],
  index: number
): CommunicationSimulationProfile {
  const request: CommunicationRequest = {
    requestId: `communication-sim-${index + 1}`,
    metadata: {
      provider: "communication",
      capability: sample.capability,
    },
    [sample.requestKey]: sample.value,
  };

  const telemetry = telemetryFor(sample.capability);
  const events = eventsFor(sample.capability);

  const plan = {
    summary: sample.summary,
    channel: sample.channel,
    audience: sample.audience,
    approvalsRequired: true,
  };

  const response: CommunicationResponse = {
    requestId: request.requestId,
    deliveryPlan: plan,
    calendarPlan: {
      summary: "Deterministic calendar coordination plan with conflict review.",
      channel: "calendar-planning",
      audience: sample.audience,
      approvalsRequired: true,
    },
    meetingPlan: {
      summary: "Deterministic meeting readiness plan with invite and agenda gates.",
      channel: "meeting-coordination",
      audience: sample.audience,
      approvalsRequired: true,
    },
    messagePlan: {
      summary: "Deterministic channel and recipient planning for future messaging workflows.",
      channel: sample.channel,
      audience: sample.audience,
      approvalsRequired: true,
    },
    recipientSummary: [sample.audience, "Policy Reviewers", "Operational Stakeholders"],
    attachments: [
      { label: "Summary Brief", kind: "summary" },
      { label: "Coordination Link", kind: "link" },
    ],
    warnings: [
      "This output is simulation-only and does not represent a real communication integration.",
      ...(sample.warning ? [sample.warning] : []),
    ],
    events,
    telemetry,
    artifacts: [
      {
        id: `communication-artifact-${index + 1}`,
        kind: "communication-plan",
        label: `${sample.capability} artifact`,
        ref: `simulation://communication/${sample.capability.replace(/\s+/g, "-")}`,
      },
    ],
  };

  const normalizedRequest: NormalizedRequest = {
    requestId: request.requestId,
    providerType: "Communication Provider",
    executionMode: "simulation",
    payloadSummary: `${sample.capability} planning request`,
    capabilities: ["Email", "Calendar", "Messaging", "Search", "Human Approval", "Simulation"],
    constraints: ["offline-only", "no-network", "no-oauth", "no-real-delivery", "no-credentials"],
    metadata: {
      provider: "communication",
      capability: sample.capability,
      channel: sample.channel,
    },
  };

  const normalizedResponse: NormalizedResponse = {
    requestId: response.requestId,
    status: "simulated",
    resultSummary: response.deliveryPlan.summary,
    artifacts: response.artifacts,
    metrics: {
      steps: response.recipientSummary.length + response.attachments.length,
      durationMs: telemetry.averageDurationMs,
      retryCount: 0,
    },
    telemetry,
    warnings: response.warnings,
    errors: [],
    events,
  };

  return {
    capability: sample.capability,
    deterministic: true,
    sampleRequest: request,
    sampleResponse: response,
    sampleFailure: makeAdapterError(
      sample.capability === "calendar" ? "TIMEOUT" : sample.capability === "email" ? "PERMISSION_DENIED" : "VALIDATION_FAILED",
      `Simulation failure sample for ${sample.capability}: live communication execution is not available in this foundation phase.`,
      { adapterId: "communication-provider-simulation" }
    ),
    expectedTelemetry: telemetry,
    expectedEvents: events,
    normalizedRequest,
    normalizedResponse,
  };
}

export const communicationSimulationProfiles: CommunicationSimulationProfile[] =
  capabilitySamples.map(buildProfile);

export const communicationPrimarySimulationProfile = communicationSimulationProfiles[0];
