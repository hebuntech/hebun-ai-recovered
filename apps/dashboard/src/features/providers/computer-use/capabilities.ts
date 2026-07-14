import type { ComputerUseCapabilityMapping } from "@/features/providers/computer-use/types";

export const computerUseCapabilityMappings: ComputerUseCapabilityMapping[] = [
  {
    computerUse: "desktop inspection",
    framework: "File System",
    description:
      "Desktop inspection is modeled as a static environment overview with no live OS access.",
  },
  {
    computerUse: "application discovery",
    framework: "Search",
    description:
      "Application discovery returns deterministic candidate applications and roles only.",
  },
  {
    computerUse: "window discovery",
    framework: "Search",
    description:
      "Window discovery is represented as planned window states and visibility assumptions.",
  },
  {
    computerUse: "window management planning",
    framework: "Human Approval",
    description:
      "Window management becomes an ordered plan with safety checkpoints, never live window control.",
  },
  {
    computerUse: "keyboard action planning",
    framework: "Human Approval",
    description:
      "Keyboard actions are expressed as reviewed interaction steps without sending any key input.",
  },
  {
    computerUse: "mouse action planning",
    framework: "Human Approval",
    description:
      "Mouse actions are modeled as intent-level steps with confirmations and restrictions.",
  },
  {
    computerUse: "clipboard planning",
    framework: "Human Approval",
    description:
      "Clipboard access is reduced to an approval-gated content handling plan only.",
  },
  {
    computerUse: "file interaction planning",
    framework: "File System",
    description:
      "File interaction is represented as pathless action planning with no filesystem access.",
  },
  {
    computerUse: "application workflow planning",
    framework: "Human Approval",
    description:
      "Application workflows are sequenced as deterministic task plans across future tools and windows.",
  },
  {
    computerUse: "desktop workflow planning",
    framework: "Human Approval",
    description:
      "Desktop workflows become auditable multi-surface plans rather than live automation.",
  },
  {
    computerUse: "multi-step execution planning",
    framework: "Human Approval",
    description:
      "Multi-step execution is expressed as a reviewed action graph with rollback and pause markers.",
  },
  {
    computerUse: "human confirmation checkpoints",
    framework: "Human Approval",
    description:
      "Human confirmation checkpoints explicitly model approval gates for sensitive future operations.",
  },
  {
    computerUse: "tool invocation planning",
    framework: "Terminal",
    description:
      "Tool invocation is limited to planned intents and constraints, never command execution.",
  },
  {
    computerUse: "session planning",
    framework: "Simulation",
    description:
      "Session planning defines deterministic modes, restrictions, and review boundaries.",
  },
  {
    computerUse: "environment inspection",
    framework: "Search",
    description:
      "Environment inspection is represented as a structured environment summary without runtime access.",
  },
];
