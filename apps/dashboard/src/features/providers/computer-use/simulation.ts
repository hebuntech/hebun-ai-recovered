import { makeAdapterError, makeEvent } from "@/features/adapters";
import type { AdapterEvent, ExecutionTelemetry } from "@/features/adapters";
import type {
  NormalizedRequest,
  NormalizedResponse,
} from "@/features/provider-framework";
import { computerUseProviderEvents } from "@/features/providers/computer-use/events";
import { computerUseProviderTelemetry } from "@/features/providers/computer-use/telemetry";
import type {
  ComputerUseCapabilityKind,
  ComputerUseRequest,
  ComputerUseResponse,
  ComputerUseSimulationProfile,
} from "@/features/providers/computer-use/types";

const capabilitySamples: Array<{
  capability: ComputerUseCapabilityKind;
  task: string;
  summary: string;
  outputFormat: ComputerUseRequest["outputFormat"];
  environment: string;
  application?: string;
  window?: string;
  target?: string;
  warning?: string;
  confirmation: string;
}> = [
  {
    capability: "desktop inspection",
    task: "Plan a read-only inspection of an executive workstation surface.",
    summary: "Prepared a deterministic desktop inspection plan covering surface inventory, focus order, and review scope.",
    outputFormat: "session-outline",
    environment: "executive-workstation",
    confirmation: "Confirm read-only inspection scope before future runtime enablement.",
  },
  {
    capability: "application discovery",
    task: "Identify which future applications would support a finance workflow.",
    summary: "Prepared a deterministic application discovery summary with role-based candidate tools and exclusions.",
    outputFormat: "structured-json",
    environment: "finance-operations-workstation",
    application: "Spreadsheet Suite",
    confirmation: "Confirm approved application family before expanding workflow scope.",
  },
  {
    capability: "window discovery",
    task: "Describe candidate windows and focus transitions for a planning session.",
    summary: "Prepared a deterministic window discovery plan with focus, context, and supporting panes.",
    outputFormat: "interaction-map",
    environment: "planning-console",
    window: "Quarterly Planning Board",
    confirmation: "Confirm window grouping and visibility assumptions.",
  },
  {
    capability: "window management planning",
    task: "Plan how multiple windows would be arranged for an audit workflow.",
    summary: "Prepared a deterministic window management plan with layout sequencing and safety gates.",
    outputFormat: "plan",
    environment: "audit-workstation",
    window: "Audit Summary",
    confirmation: "Confirm layout change authority before future live orchestration.",
  },
  {
    capability: "keyboard action planning",
    task: "Plan keyboard-driven navigation across a structured review workflow.",
    summary: "Prepared a deterministic keyboard action plan with shortcuts, pauses, and approval checkpoints.",
    outputFormat: "plan",
    environment: "review-console",
    target: "approval-summary-grid",
    confirmation: "Confirm shortcut usage policy before future runtime phases.",
  },
  {
    capability: "mouse action planning",
    task: "Plan mouse-driven interactions for a governance review surface.",
    summary: "Prepared a deterministic mouse interaction plan with target regions, pauses, and restricted steps.",
    outputFormat: "interaction-map",
    environment: "governance-console",
    target: "risk-overview-panel",
    confirmation: "Confirm click-sensitive regions and safe-mode boundaries.",
  },
  {
    capability: "clipboard planning",
    task: "Plan how sensitive content could be handled through approval-gated clipboard steps.",
    summary: "Prepared a deterministic clipboard handling plan with redaction, confirmation, and restricted operation markers.",
    outputFormat: "workflow",
    environment: "director-workstation",
    confirmation: "Confirm clipboard approval rules before any future runtime use.",
  },
  {
    capability: "desktop workflow planning",
    task: "Plan a cross-application workflow for an executive reporting task.",
    summary: "Prepared a deterministic desktop workflow plan spanning applications, windows, confirmations, and pauses.",
    outputFormat: "workflow",
    environment: "executive-ops-desktop",
    application: "Reporting Workspace",
    warning: "Workflow planning is simulated and does not represent live OS automation.",
    confirmation: "Confirm multi-app workflow ownership and policy coverage.",
  },
  {
    capability: "tool invocation planning",
    task: "Plan safe future invocation of a local tool inside a governed session.",
    summary: "Prepared a deterministic tool invocation plan with approval gates, restricted arguments, and rollback notes.",
    outputFormat: "plan",
    environment: "operations-shell-simulation",
    application: "Local Tool Runner",
    confirmation: "Confirm restricted tool categories and approval routing.",
  },
  {
    capability: "multi-step execution planning",
    task: "Plan a multi-step desktop session with checkpoints and human confirmations.",
    summary: "Prepared a deterministic multi-step execution plan with session boundaries, confirmations, and restricted actions.",
    outputFormat: "workflow",
    environment: "multi-agent-control-room",
    application: "Coordination Workspace",
    confirmation: "Confirm each high-impact phase before runtime execution is ever allowed.",
  },
];

export const computerUseSafetyRules = [
  {
    label: "Human Approval Required",
    summary: "Sensitive future operations should remain blocked behind explicit human confirmation gates.",
  },
  {
    label: "Read Only Mode",
    summary: "Observation-only workflows should be available without any write or control behavior.",
  },
  {
    label: "Safe Mode",
    summary: "High-risk actions should be reduced to advisory planning with restricted execution paths.",
  },
  {
    label: "Confirmation Gates",
    summary: "Multi-step workflows should pause at predefined checkpoints before any irreversible action.",
  },
  {
    label: "Restricted Operations",
    summary: "OS control, clipboard access, filesystem changes, and tool execution remain prohibited in this phase.",
  },
  {
    label: "Policy Enforcement",
    summary: "Future runtime operations should be evaluated against governance and policy controls before execution.",
  },
  {
    label: "Execution Lock",
    summary: "Unsafe or incomplete workflows should remain locked in planning mode until approvals are satisfied.",
  },
  {
    label: "Simulation Mode",
    summary: "All current outputs are deterministic plans and fixtures only, never live actions.",
  },
] as const;

function telemetryFor(capability: ComputerUseCapabilityKind): ExecutionTelemetry {
  const base =
    computerUseProviderTelemetry.executions +
    capabilitySamples.findIndex((item) => item.capability === capability);

  return {
    ...computerUseProviderTelemetry,
    executions: base,
    lastUpdated: "11:10",
  };
}

function eventsFor(capability: ComputerUseCapabilityKind): AdapterEvent[] {
  return [
    ...computerUseProviderEvents,
    makeEvent(
      "Execution Completed",
      "computer-use-provider-simulation",
      `Deterministic Computer Use simulation completed for ${capability}.`,
      "11:10"
    ),
  ];
}

function buildProfile(
  sample: (typeof capabilitySamples)[number],
  index: number
): ComputerUseSimulationProfile {
  const request: ComputerUseRequest = {
    requestId: `computer-use-sim-${index + 1}`,
    task: sample.task,
    environment: sample.environment,
    application: sample.application,
    window: sample.window,
    target: sample.target,
    constraints: [
      "offline-only",
      "no-os-control",
      "no-keyboard-input",
      "no-mouse-input",
      "no-shell-execution",
      "no-filesystem-access",
    ],
    workflow: [
      "Review task scope",
      "Identify planned applications and windows",
      "Insert confirmation gates",
      "Produce action and risk plan",
    ],
    session: {
      id: `session-${index + 1}`,
      mode: index % 2 === 0 ? "read-only" : "approval-gated",
      summary: "Deterministic session posture for Computer Use foundation validation.",
    },
    outputFormat: sample.outputFormat,
    metadata: {
      provider: "computer-use",
      capability: sample.capability,
    },
  };

  const telemetry = telemetryFor(sample.capability);
  const events = eventsFor(sample.capability);

  const response: ComputerUseResponse = {
    requestId: request.requestId,
    executionPlan: sample.summary,
    plannedActions: [
      {
        action: "Inspect context",
        intent: "Build a deterministic understanding of the requested environment and goals.",
        confirmationRequired: false,
      },
      {
        action: "Plan guarded interaction flow",
        intent: "Sequence future actions with approvals, pauses, and rollback markers.",
        confirmationRequired: true,
      },
      {
        action: "Prepare final review handoff",
        intent: "Ensure future runtime activation remains explicitly governed.",
        confirmationRequired: true,
      },
    ],
    plannedApplications: [
      {
        name: sample.application ?? "Workspace Shell",
        role: "Primary planned surface for the simulated workflow.",
        availability: "planned",
      },
      {
        name: "Approval Console",
        role: "Future approval checkpoint surface.",
        availability: "restricted",
      },
    ],
    plannedWindows: [
      {
        name: sample.window ?? "Primary Context Window",
        purpose: "Holds the main working surface for the simulated workflow.",
        state: "planned",
      },
      {
        name: "Confirmation Gate",
        purpose: "Represents the point where a human must review the next action.",
        state: "background",
      },
    ],
    plannedInteractions: [
      {
        type: "window",
        summary: "Sequence focus between primary context and approval checkpoints.",
        safetyLevel: "review",
      },
      {
        type: "keyboard",
        summary: "Represent future shortcut flow as a reviewed plan only.",
        safetyLevel: "restricted",
      },
      {
        type: "tool",
        summary: "Represent local tool usage as planned intent with approval gates.",
        safetyLevel: "restricted",
      },
    ],
    requiredConfirmations: [
      {
        gate: "Scope Confirmation",
        reason: sample.confirmation,
      },
      {
        gate: "Restricted Operations Gate",
        reason: "Future live desktop control remains prohibited in this foundation phase.",
      },
    ],
    riskAssessment: {
      level: "medium",
      summary: "Planned desktop workflows require strong confirmation and policy controls before any future runtime activation.",
      controls: [
        "Human approval checkpoints",
        "Read-only and safe-mode posture",
        "Restricted operation categories",
      ],
    },
    warnings: [
      "This output is simulation-only and does not represent a real Computer Use integration.",
      ...(sample.warning ? [sample.warning] : []),
    ],
    events,
    telemetry,
    artifacts: [
      {
        id: `computer-use-artifact-${index + 1}`,
        kind: "desktop-plan",
        label: `${sample.capability} artifact`,
        ref: `simulation://computer-use/${sample.capability.replace(/\s+/g, "-")}`,
      },
    ],
  };

  const normalizedRequest: NormalizedRequest = {
    requestId: request.requestId,
    providerType: "Computer Use Provider",
    executionMode: "simulation",
    payloadSummary: `${request.task} in ${request.environment}`,
    capabilities: ["Terminal", "File System", "Search", "Human Approval", "Simulation"],
    constraints: request.constraints,
    metadata: {
      provider: "computer-use",
      environment: request.environment,
      outputFormat: request.outputFormat,
      capability: sample.capability,
    },
  };

  const normalizedResponse: NormalizedResponse = {
    requestId: response.requestId,
    status: "simulated",
    resultSummary: response.executionPlan,
    artifacts: response.artifacts,
    metrics: {
      steps: response.plannedActions.length + response.requiredConfirmations.length,
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
      sample.capability === "tool invocation planning"
        ? "PERMISSION_DENIED"
        : sample.capability === "window discovery"
          ? "UNAVAILABLE"
          : "VALIDATION_FAILED",
      `Simulation failure sample for ${sample.capability}: live Computer Use execution is not available in this foundation phase.`,
      { adapterId: "computer-use-provider-simulation" }
    ),
    expectedTelemetry: telemetry,
    expectedEvents: events,
    normalizedRequest,
    normalizedResponse,
  };
}

export const computerUseSimulationProfiles: ComputerUseSimulationProfile[] =
  capabilitySamples.map(buildProfile);

export const computerUsePrimarySimulationProfile =
  computerUseSimulationProfiles[0];
