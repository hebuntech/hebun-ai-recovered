import type { CodexCapabilityMapping } from "@/features/providers/codex/types";

export const codexCapabilityMappings: CodexCapabilityMapping[] = [
  {
    codex: "code generation",
    framework: "Code Generation",
    description: "Offline code generation is represented as deterministic patch planning and structured change proposals.",
  },
  {
    codex: "code review",
    framework: "Repository",
    description: "Code review is modeled as repository-aware inspection with no live repository access.",
  },
  {
    codex: "refactoring",
    framework: "Code Generation",
    description: "Refactoring is expressed as a patch plan only, never as executed repository mutation.",
  },
  {
    codex: "test generation",
    framework: "Code Generation",
    description: "Test generation is simulated as a test-plan artifact without creating or running tests.",
  },
  {
    codex: "build analysis",
    framework: "Terminal",
    description: "Build analysis is reduced to deterministic interpretation of hypothetical build targets and risks.",
  },
  {
    codex: "repository analysis",
    framework: "Repository",
    description: "Repository analysis is modeled through provided repository context only, with no live repository operations.",
  },
  {
    codex: "bug diagnosis",
    framework: "Search",
    description: "Bug diagnosis is simulated as issue triage and hypothesis generation from local context.",
  },
  {
    codex: "migration planning",
    framework: "Code Generation",
    description: "Migration planning yields offline sequencing and affected-file analysis only.",
  },
  {
    codex: "documentation generation",
    framework: "File System",
    description: "Documentation generation is represented as deterministic document artifact planning.",
  },
  {
    codex: "developer workflow planning",
    framework: "Human Approval",
    description: "Developer workflow planning is surfaced as review-ready execution guidance and checkpoints.",
  },
];
