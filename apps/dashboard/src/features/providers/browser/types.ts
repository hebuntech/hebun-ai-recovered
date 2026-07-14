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

export const BROWSER_PROVIDER_ID = "browser";
export const BROWSER_PROVIDER_NAME = "Browser";
export const BROWSER_PROVIDER_FAMILY = "Browser";

export type BrowserCapabilityKind =
  | "page navigation"
  | "page inspection"
  | "dom analysis"
  | "element discovery"
  | "form analysis"
  | "form filling plan"
  | "click planning"
  | "scroll planning"
  | "page extraction"
  | "structured extraction"
  | "table extraction"
  | "link discovery"
  | "page summarization"
  | "accessibility inspection"
  | "screenshot planning"
  | "workflow planning";

export interface BrowserCapabilityMapping {
  browser: BrowserCapabilityKind;
  framework: AdapterCapabilityKind;
  description: string;
}

export type BrowserCredentialStatus =
  | "not-configured"
  | "placeholder"
  | "runtime-injected";

export interface BrowserConfig extends ProviderConfig {
  defaultViewport: string;
  credentialStatus: BrowserCredentialStatus;
}

export type BrowserOutputFormat =
  | "summary"
  | "structure"
  | "outline"
  | "plan"
  | "table"
  | "structured-json";

export interface BrowserViewport {
  width: number;
  height: number;
  mode: "desktop" | "tablet" | "mobile";
}

export interface BrowserWaitCondition {
  type: "dom-ready" | "content-visible" | "network-idle" | "layout-stable";
  description: string;
}

export interface BrowserRequest {
  requestId: string;
  url: string;
  pageId: string;
  task: string;
  selectors: string[];
  constraints: string[];
  viewport: BrowserViewport;
  waitConditions: BrowserWaitCondition[];
  outputFormat: BrowserOutputFormat;
  metadata: Record<string, string>;
}

export interface BrowserPageStructure {
  title: string;
  primaryRegion: string;
  sections: string[];
  interactionModel: string;
}

export interface BrowserDomNode {
  label: string;
  role: string;
  summary: string;
}

export interface BrowserFormRecord {
  id: string;
  purpose: string;
  fields: string[];
  submissionModel: string;
}

export interface BrowserTableRecord {
  id: string;
  title: string;
  columns: string[];
  rowEstimate: number;
}

export interface BrowserLinkRecord {
  label: string;
  href: string;
  intent: string;
}

export interface BrowserImageRecord {
  alt: string;
  purpose: string;
}

export interface BrowserSectionRecord {
  label: string;
  priority: "primary" | "secondary" | "supporting";
  summary: string;
}

export interface BrowserSuggestedAction {
  action: string;
  rationale: string;
}

export interface BrowserResponse {
  requestId: string;
  pageSummary: string;
  pageStructure: BrowserPageStructure;
  domOutline: BrowserDomNode[];
  forms: BrowserFormRecord[];
  tables: BrowserTableRecord[];
  links: BrowserLinkRecord[];
  images: BrowserImageRecord[];
  sections: BrowserSectionRecord[];
  suggestedActions: BrowserSuggestedAction[];
  warnings: string[];
  events: AdapterEvent[];
  telemetry: ExecutionTelemetry;
  artifacts: ExecutionArtifact[];
}

export type BrowserErrorCategory =
  | "validation"
  | "configuration"
  | "permission"
  | "timeout"
  | "navigation"
  | "page_not_found"
  | "element_not_found"
  | "selector_error"
  | "unsupported_action"
  | "execution"
  | "unknown";

export interface BrowserSimulationProfile {
  capability: BrowserCapabilityKind;
  deterministic: boolean;
  sampleRequest: BrowserRequest;
  sampleResponse: BrowserResponse;
  sampleFailure: AdapterError;
  expectedTelemetry: ExecutionTelemetry;
  expectedEvents: AdapterEvent[];
  normalizedRequest: NormalizedRequest;
  normalizedResponse: NormalizedResponse;
}

export interface BrowserMetrics {
  status: "simulation" | "ready" | "disabled";
  simulationMode: boolean;
  capabilityCoverage: number;
  conformanceScore: number;
  credentialStatus: BrowserCredentialStatus;
  healthStatus: string;
  simulationReadiness: string;
  healthBadge: BadgeVariant;
}
