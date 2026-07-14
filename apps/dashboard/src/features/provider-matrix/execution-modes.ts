/*
 * execution-modes.ts — deterministic execution modes supported across the
 * provider network. Every provider is simulation-first and offline; live
 * execution is a future mode only. No mode performs real execution.
 */

import { PROVIDER_ORDER } from "@/features/provider-matrix/capability-matrix";
import type { ExecutionModeDefinition, ExecutionModeKind, ProviderId } from "@/features/provider-matrix/types";

const providersByMode: Record<ExecutionModeKind, ProviderId[]> = {
  Simulation: [...PROVIDER_ORDER],
  "Dry Run": ["codex", "github"],
  "Approval Required": ["computer-use", "communication"],
  "Read Only": ["github", "browser"],
  "Planning Only": ["claude"],
  "Future Live": [...PROVIDER_ORDER],
};

export const executionModes: ExecutionModeDefinition[] = [
  {
    mode: "Simulation",
    label: "Simulation",
    description: "Deterministic offline simulation. The only active execution mode today.",
    active: true,
    providers: providersByMode.Simulation,
  },
  {
    mode: "Dry Run",
    label: "Dry Run",
    description: "Plans and validates an execution without applying any side effects.",
    active: true,
    providers: providersByMode["Dry Run"],
  },
  {
    mode: "Approval Required",
    label: "Approval Required",
    description: "Routes through Human Approval + Policy before any future live action.",
    active: true,
    providers: providersByMode["Approval Required"],
  },
  {
    mode: "Read Only",
    label: "Read Only",
    description: "Read-oriented retrieval with no mutating operations.",
    active: true,
    providers: providersByMode["Read Only"],
  },
  {
    mode: "Planning Only",
    label: "Planning Only",
    description: "Produces plans and reasoning artifacts; execution is delegated elsewhere.",
    active: true,
    providers: providersByMode["Planning Only"],
  },
  {
    mode: "Future Live",
    label: "Future Live",
    description: "Reserved for future live provider execution. Not enabled in this phase.",
    active: false,
    providers: providersByMode["Future Live"],
  },
];

export function modesForProvider(id: ProviderId): ExecutionModeKind[] {
  return executionModes.filter((m) => m.providers.includes(id)).map((m) => m.mode);
}
