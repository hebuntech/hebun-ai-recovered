import type { BadgeVariant } from "@/components/ui/badge";
import type { ProviderHealth, ProviderTypeKind } from "@/features/provider-framework";

export type ProviderId =
  | "claude"
  | "codex"
  | "github"
  | "browser"
  | "computer-use"
  | "communication";

export type MatrixCapability =
  | "Reasoning"
  | "Code Generation"
  | "Repository"
  | "Browser"
  | "Desktop"
  | "Communication"
  | "Planning"
  | "Execution"
  | "Review"
  | "Knowledge Retrieval"
  | "Search"
  | "Human Approval"
  | "Simulation"
  | "Future Live";

export type CapabilitySupport = "primary" | "secondary" | "unsupported";
export type ExecutionModeKind =
  | "Simulation"
  | "Dry Run"
  | "Approval Required"
  | "Read Only"
  | "Planning Only"
  | "Future Live";
export type PriorityTier =
  | "Primary"
  | "Secondary"
  | "Fallback"
  | "Disabled"
  | "Experimental"
  | "Future";
export type GapStatus = "covered" | "partial" | "missing";

export interface MatrixCell {
  providerId: ProviderId;
  capability: MatrixCapability;
  support: CapabilitySupport;
}

export interface MatrixRow {
  providerId: ProviderId;
  name: string;
  cells: MatrixCell[];
}

export interface CapabilityMatrix {
  capabilities: MatrixCapability[];
  rows: MatrixRow[];
}

export interface ExecutionModeDefinition {
  mode: ExecutionModeKind;
  label: string;
  description: string;
  active: boolean;
  providers: ProviderId[];
}

export interface ProviderCatalogEntry {
  id: ProviderId;
  name: string;
  family: string;
  providerType: ProviderTypeKind;
  status: string;
  executionMode: ExecutionModeKind;
  simulationSupport: boolean;
  liveSupport: boolean;
  primaryCapabilities: MatrixCapability[];
  secondaryCapabilities: MatrixCapability[];
  health: ProviderHealth;
  conformanceScore: number;
  capabilityCoverage: number;
  credentialStatus: string;
  priority: PriorityTier;
}

export interface RoutingRule {
  capability: MatrixCapability;
  primary: ProviderId | null;
  secondary: ProviderId[];
  requiresHumanApproval: boolean;
  note: string;
}

export interface ProviderPriority {
  providerId: ProviderId;
  tier: PriorityTier;
  rank: number;
  rationale: string;
  badge: BadgeVariant;
}

export interface ProviderOverlap {
  a: ProviderId;
  b: ProviderId;
  sharedCapabilities: MatrixCapability[];
  overlapScore: number;
  note: string;
}

export interface CapabilityGap {
  capability: MatrixCapability;
  status: GapStatus;
  providerCount: number;
  note: string;
}

export interface FutureProviderGap {
  domain: string;
  status: "Future Provider Required";
  note: string;
}

export interface ProviderScore {
  providerId: ProviderId;
  name: string;
  coverage: number;
  capabilityBreadth: number;
  simulationReadiness: number;
  routingPriority: number;
  integrationReadiness: number;
  health: number;
  total: number;
  badge: BadgeVariant;
}

export interface NetworkHealth {
  overallHealth: number;
  simulationCoverage: number;
  capabilityCoverage: number;
  coveredCapabilities: number;
  totalCapabilities: number;
  missingProviders: number;
  healthyProviders: number;
  providerCount: number;
  badge: BadgeVariant;
}

export interface ProviderSelectionResult {
  capability: MatrixCapability;
  primary: ProviderId | null;
  fallbacks: ProviderId[];
  requiresHumanApproval: boolean;
  selectedProvider: ProviderId | null;
  note: string;
}

export interface ProviderMatrix {
  catalog: ProviderCatalogEntry[];
  matrix: CapabilityMatrix;
  executionModes: ExecutionModeDefinition[];
  routing: RoutingRule[];
  priorities: ProviderPriority[];
  overlaps: ProviderOverlap[];
  gaps: CapabilityGap[];
  futureProviders: FutureProviderGap[];
  scores: ProviderScore[];
  health: NetworkHealth;
}
