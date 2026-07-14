import type { ProviderTypeDefinition, ProviderTypeKind } from "@/features/provider-framework/types";

/*
 * provider-metadata.ts — the framework's provider taxonomy.
 *
 * Definitions only. These describe which capabilities and execution modes each
 * future provider category maps to. No provider is implemented here.
 */
export const providerTypeDefinitions: ProviderTypeDefinition[] = [
  { id: "pt-llm", type: "LLM Provider", label: "LLM Provider", description: "Reasoning, generation and tool-use over natural language.", defaultCapabilities: ["Code Generation", "Search"], executionModes: ["simulation", "sandbox", "live"], status: "framework-only" },
  { id: "pt-computer", type: "Computer Use Provider", label: "Computer Use Provider", description: "Desktop/GUI automation of native applications.", defaultCapabilities: ["Terminal", "File System"], executionModes: ["simulation", "sandbox"], status: "framework-only" },
  { id: "pt-browser", type: "Browser Provider", label: "Browser Provider", description: "Headless/interactive web navigation and scraping.", defaultCapabilities: ["Browser", "Search"], executionModes: ["simulation", "sandbox", "live"], status: "framework-only" },
  { id: "pt-communication", type: "Communication Provider", label: "Communication Provider", description: "Email, messaging, calendar, meetings, and collaboration workflows.", defaultCapabilities: ["Email", "Calendar", "Messaging"], executionModes: ["simulation", "live"], status: "framework-only" },
  { id: "pt-repo", type: "Repository Provider", label: "Repository Provider", description: "Clone, branch, commit and pull-request workflows.", defaultCapabilities: ["Repository", "File System"], executionModes: ["simulation", "sandbox", "live"], status: "framework-only" },
  { id: "pt-email", type: "Email Provider", label: "Email Provider", description: "Send and read email.", defaultCapabilities: ["Email"], executionModes: ["simulation", "live"], status: "framework-only" },
  { id: "pt-cal", type: "Calendar Provider", label: "Calendar Provider", description: "Read and schedule calendar events.", defaultCapabilities: ["Calendar"], executionModes: ["simulation", "live"], status: "framework-only" },
  { id: "pt-msg", type: "Messaging Provider", label: "Messaging Provider", description: "Post and read chat messages.", defaultCapabilities: ["Messaging"], executionModes: ["simulation", "live"], status: "framework-only" },
  { id: "pt-search", type: "Search Provider", label: "Search Provider", description: "Query external and internal search sources.", defaultCapabilities: ["Search"], executionModes: ["simulation", "live"], status: "framework-only" },
  { id: "pt-automation", type: "Automation Provider", label: "Automation Provider", description: "Scripted multi-step automation flows.", defaultCapabilities: ["Terminal", "File System", "Repository"], executionModes: ["simulation", "sandbox"], status: "framework-only" },
  { id: "pt-human", type: "Human Approval Provider", label: "Human Approval Provider", description: "Routes steps to a human decision gate.", defaultCapabilities: ["Human Approval"], executionModes: ["simulation", "live"], status: "framework-only" },
];

export function providerTypeByKind(kind: ProviderTypeKind): ProviderTypeDefinition | undefined {
  return providerTypeDefinitions.find((p) => p.type === kind);
}

export function providerTypeKinds(): ProviderTypeKind[] {
  return providerTypeDefinitions.map((p) => p.type);
}
