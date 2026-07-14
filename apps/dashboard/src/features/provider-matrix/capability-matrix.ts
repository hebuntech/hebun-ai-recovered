/*
 * capability-matrix.ts — deterministic capability matrix. The raw support map
 * below is the SINGLE SOURCE OF TRUTH the whole matrix layer derives from:
 * catalog primary/secondary lists, routing, overlap, gaps and scores all read
 * from here. Capabilities not listed for a provider are "unsupported".
 */

import type {
  CapabilityMatrix,
  CapabilitySupport,
  MatrixCapability,
  MatrixCell,
  MatrixRow,
  ProviderId,
} from "@/features/provider-matrix/types";

export const MATRIX_CAPABILITIES: MatrixCapability[] = [
  "Reasoning",
  "Code Generation",
  "Repository",
  "Browser",
  "Desktop",
  "Communication",
  "Planning",
  "Execution",
  "Review",
  "Knowledge Retrieval",
  "Search",
  "Human Approval",
  "Simulation",
  "Future Live",
];

export const PROVIDER_ORDER: ProviderId[] = [
  "claude",
  "codex",
  "github",
  "browser",
  "computer-use",
  "communication",
];

export const PROVIDER_NAMES: Record<ProviderId, string> = {
  claude: "Claude",
  codex: "Codex",
  github: "GitHub",
  browser: "Browser",
  "computer-use": "Computer Use",
  communication: "Communication",
};

/**
 * Raw support map — only "primary" and "secondary" entries are declared.
 * Every provider supports Simulation (primary) and future Live execution
 * (secondary/planned) by framework convention.
 */
type SupportMap = Partial<Record<MatrixCapability, Exclude<CapabilitySupport, "unsupported">>>;

export const providerSupport: Record<ProviderId, SupportMap> = {
  claude: {
    Reasoning: "primary",
    Planning: "primary",
    Review: "primary",
    "Code Generation": "secondary",
    Execution: "secondary",
    "Knowledge Retrieval": "secondary",
    Search: "secondary",
    Simulation: "primary",
    "Future Live": "secondary",
  },
  codex: {
    "Code Generation": "primary",
    Execution: "primary",
    Repository: "secondary",
    Review: "secondary",
    Reasoning: "secondary",
    Planning: "secondary",
    Simulation: "primary",
    "Future Live": "secondary",
  },
  github: {
    Repository: "primary",
    "Code Generation": "secondary",
    Review: "secondary",
    Execution: "secondary",
    Simulation: "primary",
    "Future Live": "secondary",
  },
  browser: {
    Browser: "primary",
    Search: "primary",
    "Knowledge Retrieval": "secondary",
    Execution: "secondary",
    Simulation: "primary",
    "Future Live": "secondary",
  },
  "computer-use": {
    Desktop: "primary",
    "Human Approval": "primary",
    Browser: "secondary",
    Execution: "secondary",
    Simulation: "primary",
    "Future Live": "secondary",
  },
  communication: {
    Communication: "primary",
    "Human Approval": "primary",
    Execution: "secondary",
    Simulation: "primary",
    "Future Live": "secondary",
  },
};

/** support level of one provider for one capability (defaults to unsupported) */
export function supportOf(providerId: ProviderId, capability: MatrixCapability): CapabilitySupport {
  return providerSupport[providerId][capability] ?? "unsupported";
}

/** capabilities of a given support level for a provider, in column order */
export function capabilitiesBySupport(
  providerId: ProviderId,
  level: CapabilitySupport
): MatrixCapability[] {
  return MATRIX_CAPABILITIES.filter((c) => supportOf(providerId, c) === level);
}

/** providers that offer a capability at a given support level, in provider order */
export function providersFor(capability: MatrixCapability, level: CapabilitySupport): ProviderId[] {
  return PROVIDER_ORDER.filter((p) => supportOf(p, capability) === level);
}

export function buildCapabilityMatrix(): CapabilityMatrix {
  const rows: MatrixRow[] = PROVIDER_ORDER.map((providerId) => {
    const cells: MatrixCell[] = MATRIX_CAPABILITIES.map((capability) => ({
      providerId,
      capability,
      support: supportOf(providerId, capability),
    }));
    return { providerId, name: PROVIDER_NAMES[providerId], cells };
  });

  return { capabilities: MATRIX_CAPABILITIES, rows };
}

export const capabilityMatrix: CapabilityMatrix = buildCapabilityMatrix();
