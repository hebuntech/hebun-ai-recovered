import { makeAdapterError, makeEvent } from "@/features/adapters";
import type { AdapterEvent, ExecutionTelemetry } from "@/features/adapters";
import type {
  NormalizedRequest,
  NormalizedResponse,
} from "@/features/provider-framework";
import { browserProviderEvents } from "@/features/providers/browser/events";
import { browserProviderTelemetry } from "@/features/providers/browser/telemetry";
import type {
  BrowserCapabilityKind,
  BrowserRequest,
  BrowserResponse,
  BrowserSimulationProfile,
} from "@/features/providers/browser/types";

const capabilitySamples: Array<{
  capability: BrowserCapabilityKind;
  task: string;
  summary: string;
  outputFormat: BrowserRequest["outputFormat"];
  selectors: string[];
  pageId: string;
  url: string;
  warning?: string;
  suggestedAction: string;
}> = [
  {
    capability: "page navigation",
    task: "Plan a safe path through a multi-step director dashboard workflow.",
    summary: "Prepared a deterministic page-navigation plan with checkpoints, route sequence, and exit conditions.",
    outputFormat: "plan",
    selectors: ["nav[aria-label='Primary']", "main"],
    pageId: "director-dashboard",
    url: "simulation://dashboard/director",
    suggestedAction: "Validate route sequence before enabling any future live browser provider.",
  },
  {
    capability: "page inspection",
    task: "Summarize the intent and structure of a director-facing overview page.",
    summary: "Prepared a deterministic page inspection summary covering structure, emphasis, and operator intent.",
    outputFormat: "summary",
    selectors: ["header", "section[data-surface='overview']"],
    pageId: "executive-overview",
    url: "simulation://director/overview",
    suggestedAction: "Confirm summary expectations against registry and provider surfaces.",
  },
  {
    capability: "dom analysis",
    task: "Describe the hierarchy of an enterprise dashboard page.",
    summary: "Prepared a deterministic DOM-outline interpretation for regions, landmarks, and actionable nodes.",
    outputFormat: "outline",
    selectors: ["main", "section", "[data-testid]"],
    pageId: "registry-console",
    url: "simulation://director/registries",
    suggestedAction: "Use the outline to define future structured extraction contracts.",
  },
  {
    capability: "form analysis",
    task: "Review an approval form layout and determine field intent.",
    summary: "Prepared a deterministic form analysis with field grouping, submission model, and validation expectations.",
    outputFormat: "structure",
    selectors: ["form", "label", "input", "button[type='submit']"],
    pageId: "approval-form",
    url: "simulation://director/governance/approvals",
    suggestedAction: "Map required fields and approval gates before any future live interaction phase.",
  },
  {
    capability: "form filling plan",
    task: "Plan how a future provider would complete a structured approval form.",
    summary: "Prepared a deterministic form-filling plan with preconditions, checkpoints, and human review gates.",
    outputFormat: "plan",
    selectors: ["form[data-kind='approval']"],
    pageId: "policy-approval-form",
    url: "simulation://director/policy",
    suggestedAction: "Keep final submission behind a human approval checkpoint.",
  },
  {
    capability: "structured extraction",
    task: "Extract governance metrics into a typed schema.",
    summary: "Prepared a deterministic structured extraction plan for cards, metrics, and summary blocks.",
    outputFormat: "structured-json",
    selectors: ["[data-metric]", "article", "table"],
    pageId: "governance-center",
    url: "simulation://director/governance",
    suggestedAction: "Align extraction schema with registry and reasoning surfaces.",
  },
  {
    capability: "table extraction",
    task: "Describe the shape of a registry table and identify its export fields.",
    summary: "Prepared a deterministic table extraction plan with columns, row classes, and export intent.",
    outputFormat: "table",
    selectors: ["table", "thead", "tbody"],
    pageId: "registry-table",
    url: "simulation://director/registries/plans",
    suggestedAction: "Validate table contracts before any future live scraping provider.",
  },
  {
    capability: "page summarization",
    task: "Summarize a dense director surface into an executive brief.",
    summary: "Prepared a deterministic page summary emphasizing outcomes, risks, and operator actions.",
    outputFormat: "summary",
    selectors: ["main", "article", "aside"],
    pageId: "reasoning-center",
    url: "simulation://director/reasoning",
    suggestedAction: "Route the summary into future reasoning and planning traces.",
  },
  {
    capability: "accessibility inspection",
    task: "Review a director page for accessible structure and content labeling.",
    summary: "Prepared a deterministic accessibility inspection covering landmarks, headings, labels, and focus expectations.",
    outputFormat: "outline",
    selectors: ["header", "nav", "main", "form", "[aria-*]"],
    pageId: "memory-center",
    url: "simulation://director/memory",
    suggestedAction: "Track missing landmarks and label gaps before future interaction phases.",
  },
  {
    capability: "workflow planning",
    task: "Plan a multi-page browser workflow for a future operator journey.",
    summary: "Prepared a deterministic browser workflow plan with route order, decision points, and rollback markers.",
    outputFormat: "plan",
    selectors: ["nav", "button", "a"],
    pageId: "provider-workflow",
    url: "simulation://director/providers/browser",
    warning: "Workflow planning is simulated and does not represent live page execution.",
    suggestedAction: "Treat each step as advisory until a later real browser integration phase.",
  },
];

function telemetryFor(capability: BrowserCapabilityKind): ExecutionTelemetry {
  const base =
    browserProviderTelemetry.executions +
    capabilitySamples.findIndex((item) => item.capability === capability);

  return {
    ...browserProviderTelemetry,
    executions: base,
    lastUpdated: "10:45",
  };
}

function eventsFor(capability: BrowserCapabilityKind): AdapterEvent[] {
  return [
    ...browserProviderEvents,
    makeEvent(
      "Execution Completed",
      "browser-provider-simulation",
      `Deterministic Browser simulation completed for ${capability}.`,
      "10:45"
    ),
  ];
}

function buildProfile(
  sample: (typeof capabilitySamples)[number],
  index: number
): BrowserSimulationProfile {
  const request: BrowserRequest = {
    requestId: `browser-sim-${index + 1}`,
    url: sample.url,
    pageId: sample.pageId,
    task: sample.task,
    selectors: sample.selectors,
    constraints: [
      "offline-only",
      "no-network",
      "no-browser-process",
      "no-javascript-execution",
      "no-web-automation",
      "no-screenshots",
    ],
    viewport: {
      width: 1440,
      height: 900,
      mode: "desktop",
    },
    waitConditions: [
      { type: "dom-ready", description: "Plan analysis assumes the page shell is conceptually available." },
      { type: "layout-stable", description: "Plan output assumes the layout has reached a stable reading state." },
    ],
    outputFormat: sample.outputFormat,
    metadata: {
      provider: "browser",
      capability: sample.capability,
    },
  };

  const telemetry = telemetryFor(sample.capability);
  const events = eventsFor(sample.capability);

  const response: BrowserResponse = {
    requestId: request.requestId,
    pageSummary: sample.summary,
    pageStructure: {
      title: `${sample.pageId} simulation surface`,
      primaryRegion: "main content workspace",
      sections: ["header", "navigation", "summary", "detail panels", "actions"],
      interactionModel: "read-plan-review",
    },
    domOutline: [
      { label: "Page Header", role: "banner", summary: "Primary title and operator context." },
      { label: "Navigation Rail", role: "navigation", summary: "Section routing and provider access points." },
      { label: "Main Workspace", role: "main", summary: "Executive content, metrics, and planning panels." },
    ],
    forms: [
      {
        id: `${sample.pageId}-form-1`,
        purpose: "Representative structured input zone for simulation planning.",
        fields: ["title", "status", "owner", "notes"],
        submissionModel: "review-before-submit",
      },
    ],
    tables: [
      {
        id: `${sample.pageId}-table-1`,
        title: "Representative data table",
        columns: ["name", "status", "owner", "updated"],
        rowEstimate: 12,
      },
    ],
    links: [
      {
        label: "Overview",
        href: sample.url,
        intent: "Stay within the current simulated workflow.",
      },
      {
        label: "Related detail page",
        href: `${sample.url}/detail`,
        intent: "Continue structured inspection within the same simulated surface.",
      },
    ],
    images: [
      {
        alt: "Representative executive chart",
        purpose: "Supports summary interpretation and screenshot planning.",
      },
    ],
    sections: [
      {
        label: "Executive Summary",
        priority: "primary",
        summary: "High-signal overview for the operator.",
      },
      {
        label: "Operational Detail",
        priority: "secondary",
        summary: "Structured supporting information for deeper analysis.",
      },
    ],
    suggestedActions: [
      {
        action: "Validate selectors and target sections against the future provider contract.",
        rationale: "Ensures simulated plans remain traceable when real integrations are introduced later.",
      },
      {
        action: sample.suggestedAction,
        rationale: "Preserves determinism and auditability in the foundation phase.",
      },
    ],
    warnings: [
      "This output is simulation-only and does not represent a real browser integration.",
      ...(sample.warning ? [sample.warning] : []),
    ],
    events,
    telemetry,
    artifacts: [
      {
        id: `browser-artifact-${index + 1}`,
        kind: "browser-plan",
        label: `${sample.capability} artifact`,
        ref: `simulation://browser/${sample.capability.replace(/\s+/g, "-")}`,
      },
    ],
  };

  const normalizedRequest: NormalizedRequest = {
    requestId: request.requestId,
    providerType: "Browser Provider",
    executionMode: "simulation",
    payloadSummary: `${request.task} on ${request.pageId}`,
    capabilities: ["Browser", "Search", "File System", "Human Approval", "Simulation"],
    constraints: request.constraints,
    metadata: {
      provider: "browser",
      pageId: request.pageId,
      outputFormat: request.outputFormat,
      capability: sample.capability,
    },
  };

  const normalizedResponse: NormalizedResponse = {
    requestId: response.requestId,
    status: "simulated",
    resultSummary: response.pageSummary,
    artifacts: response.artifacts,
    metrics: {
      steps: response.suggestedActions.length + response.domOutline.length,
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
      sample.capability === "page navigation"
        ? "TIMEOUT"
        : sample.capability === "form filling plan"
          ? "PERMISSION_DENIED"
          : "VALIDATION_FAILED",
      `Simulation failure sample for ${sample.capability}: live browser execution is not available in this foundation phase.`,
      { adapterId: "browser-provider-simulation" }
    ),
    expectedTelemetry: telemetry,
    expectedEvents: events,
    normalizedRequest,
    normalizedResponse,
  };
}

export const browserSimulationProfiles: BrowserSimulationProfile[] =
  capabilitySamples.map(buildProfile);

export const browserPrimarySimulationProfile = browserSimulationProfiles[0];
