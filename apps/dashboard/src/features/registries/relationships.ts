import type { RegistryRelationship } from "@/features/registries/types";

export const registryRelationships: RegistryRelationship[] = [
  { from: "goals", to: "plans" },
  { from: "plans", to: "executions" },
  { from: "executions", to: "experience" },
  { from: "experience", to: "learning" },
  { from: "learning", to: "governance" },
  { from: "agents", to: "executions" },
  { from: "tools", to: "executions" },
  { from: "workflows", to: "executions" },
  { from: "entities", to: "goals" },
  { from: "risk", to: "governance" },
];
