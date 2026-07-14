import type { ReasoningScenario } from "@/features/reasoning/types";

export const reasoningScenarios: ReasoningScenario[] = [
  {
    id: "reasoning-1",
    title: "Stabilize explainability coverage before scaling HR screening",
    objective:
      "Determine the safest next step for improving explainability without slowing all HR-related workflows unnecessarily.",
    focus:
      "The company needs a deterministic recommendation that balances learning quality, governance control, and workflow continuity.",
    query: "explainability screening governance learning",
    registryIds: ["learning", "governance", "risk", "workflows", "experience"],
    hardConstraints: [
      "Do not weaken governance or explainability controls",
      "Do not rely on unreferenced data",
    ],
    softConstraints: [
      "Keep HR workflow throughput moving where safe",
      "Favor reusable operating patterns over ad hoc fixes",
    ],
    goalLabels: [
      "Improve explainability quality",
      "Reduce governance risk",
      "Preserve workflow continuity",
    ],
    timestamp: "2026-07-06T09:15:00.000Z",
  },
  {
    id: "reasoning-2",
    title: "Reduce approval friction without reducing enterprise control",
    objective:
      "Identify the best way to lower approval drag while keeping traceable governance coverage intact.",
    focus:
      "The director needs a recommendation on whether to stabilize, balance, or accelerate approval flow changes.",
    query: "approval governance events policies execution",
    registryIds: ["governance", "events", "executions", "policies", "risk"],
    hardConstraints: [
      "Preserve auditability and policy traceability",
      "Avoid introducing hidden approval risk",
    ],
    softConstraints: [
      "Reduce operational friction for enterprise motions",
      "Prefer reusable governance patterns",
    ],
    goalLabels: [
      "Lower approval latency",
      "Keep governance explainable",
      "Retain director visibility",
    ],
    timestamp: "2026-07-06T09:30:00.000Z",
  },
  {
    id: "reasoning-3",
    title: "Strengthen experience coverage before expanding recommendation usage",
    objective:
      "Choose the best path for improving experience and learning quality before recommendations scale further.",
    focus:
      "The engine should weigh coverage gaps against the need to preserve recommendation momentum.",
    query: "experience learning recommendations capability coverage",
    registryIds: ["experience", "learning", "capabilities", "executions"],
    hardConstraints: [
      "Do not expand recommendation reliance faster than evidence quality",
      "Keep memory and graph references intact",
    ],
    softConstraints: [
      "Preserve useful learning throughput",
      "Favor options that can be reused across more than one registry",
    ],
    goalLabels: [
      "Increase assurance density",
      "Preserve recommendation usefulness",
      "Improve learning quality",
    ],
    timestamp: "2026-07-06T09:45:00.000Z",
  },
];
