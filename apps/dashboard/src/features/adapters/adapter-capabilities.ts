import type { AdapterCapabilityKind, ExecutionCapability } from "@/features/adapters/types";

/*
 * Capability catalog — the SDK surface. Every future adapter declares which
 * of these it implements. Each capability is independently discoverable.
 */
export const capabilityCatalog: ExecutionCapability[] = [
  { id: "cap-fs", kind: "File System", label: "File System", description: "Read, write and manage files within an isolated workspace.", deterministic: true },
  { id: "cap-term", kind: "Terminal", label: "Terminal", description: "Run shell commands in a sandboxed environment.", deterministic: true },
  { id: "cap-browser", kind: "Browser", label: "Browser", description: "Navigate and interact with web pages.", deterministic: false },
  { id: "cap-codegen", kind: "Code Generation", label: "Code Generation", description: "Generate and edit source code.", deterministic: false },
  { id: "cap-repo", kind: "Repository", label: "Repository", description: "Clone, branch, commit and open pull requests.", deterministic: true },
  { id: "cap-email", kind: "Email", label: "Email", description: "Send and read email.", deterministic: true },
  { id: "cap-msg", kind: "Messaging", label: "Messaging", description: "Post and read chat messages.", deterministic: true },
  { id: "cap-cal", kind: "Calendar", label: "Calendar", description: "Read and schedule calendar events.", deterministic: true },
  { id: "cap-search", kind: "Search", label: "Search", description: "Query external and internal search sources.", deterministic: true },
  { id: "cap-sim", kind: "Simulation", label: "Simulation", description: "Deterministic mock execution for pipeline validation.", deterministic: true },
  { id: "cap-human", kind: "Human Approval", label: "Human Approval", description: "Route steps to a human decision gate.", deterministic: true },
];

export function capabilityByKind(kind: AdapterCapabilityKind): ExecutionCapability | undefined {
  return capabilityCatalog.find((c) => c.kind === kind);
}

export function capabilityKinds(): AdapterCapabilityKind[] {
  return capabilityCatalog.map((c) => c.kind);
}

/** capabilities matching a set of requested kinds — powers capability discovery */
export function matchCapabilities(kinds: AdapterCapabilityKind[]): ExecutionCapability[] {
  return capabilityCatalog.filter((c) => kinds.includes(c.kind));
}
