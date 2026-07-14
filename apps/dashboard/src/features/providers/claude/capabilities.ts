import type { ClaudeCapabilityMapping } from "@/features/providers/claude/types";

export const claudeCapabilityMappings: ClaudeCapabilityMapping[] = [
  {
    claude: "reasoning",
    framework: "Code Generation",
    description: "Deterministic reasoning summaries are represented as structured offline planning support.",
  },
  {
    claude: "text generation",
    framework: "Code Generation",
    description: "Text output is modeled as generated offline content, not a live model call.",
  },
  {
    claude: "summarization",
    framework: "Search",
    description: "Summaries are framed as retrieval-oriented result condensation for simulation.",
  },
  {
    claude: "classification",
    framework: "Search",
    description: "Classification is modeled as deterministic categorization in simulation mode.",
  },
  {
    claude: "planning support",
    framework: "Human Approval",
    description: "Planning support is exposed as recommendation scaffolding for future human-reviewed flows.",
  },
  {
    claude: "extraction",
    framework: "File System",
    description: "Document extraction is treated as offline processing of local artifacts only.",
  },
  {
    claude: "structured output",
    framework: "Code Generation",
    description: "Structured outputs are represented as deterministic schema-shaped results.",
  },
  {
    claude: "tool-call planning",
    framework: "Terminal",
    description: "Tool planning is modeled as abstract execution planning with no real tool invocation.",
  },
  {
    claude: "document analysis",
    framework: "File System",
    description: "Document analysis is simulated against local placeholder document inputs only.",
  },
];
