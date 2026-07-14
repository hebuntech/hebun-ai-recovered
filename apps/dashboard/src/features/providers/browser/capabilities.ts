import type { BrowserCapabilityMapping } from "@/features/providers/browser/types";

export const browserCapabilityMappings: BrowserCapabilityMapping[] = [
  {
    browser: "page navigation",
    framework: "Browser",
    description:
      "Page navigation is modeled as offline route and state planning with no live URL loading.",
  },
  {
    browser: "page inspection",
    framework: "Browser",
    description:
      "Page inspection is reduced to deterministic page summaries and structural snapshots only.",
  },
  {
    browser: "dom analysis",
    framework: "Browser",
    description:
      "DOM analysis is represented as simulated outline interpretation without any real DOM execution.",
  },
  {
    browser: "element discovery",
    framework: "Search",
    description:
      "Element discovery yields selector candidates and region summaries rather than real element lookup.",
  },
  {
    browser: "form analysis",
    framework: "Browser",
    description:
      "Form analysis is modeled as static field and submission-flow interpretation.",
  },
  {
    browser: "form filling plan",
    framework: "Human Approval",
    description:
      "Form filling becomes a deterministic completion plan with safety checkpoints, never live input.",
  },
  {
    browser: "click planning",
    framework: "Human Approval",
    description:
      "Click planning surfaces ordered UI actions without performing any interaction.",
  },
  {
    browser: "scroll planning",
    framework: "Browser",
    description:
      "Scroll planning is expressed as region traversal advice rather than viewport movement.",
  },
  {
    browser: "page extraction",
    framework: "Search",
    description:
      "Page extraction returns deterministic extraction plans and content buckets only.",
  },
  {
    browser: "structured extraction",
    framework: "Search",
    description:
      "Structured extraction is modeled as schema-aligned field projection with no runtime parsing.",
  },
  {
    browser: "table extraction",
    framework: "Search",
    description:
      "Table extraction is represented as offline table shape summaries and row estimates.",
  },
  {
    browser: "link discovery",
    framework: "Search",
    description:
      "Link discovery returns deterministic navigation targets and intent classification only.",
  },
  {
    browser: "page summarization",
    framework: "Search",
    description:
      "Page summarization is expressed as static content summarization with no browsing engine.",
  },
  {
    browser: "accessibility inspection",
    framework: "Browser",
    description:
      "Accessibility inspection is simulated as landmark, heading, and form-label review guidance.",
  },
  {
    browser: "screenshot planning",
    framework: "File System",
    description:
      "Screenshot planning defines capture targets and framing rules without capturing images.",
  },
  {
    browser: "workflow planning",
    framework: "Human Approval",
    description:
      "Workflow planning sequences future browser tasks as an auditable offline plan.",
  },
];
