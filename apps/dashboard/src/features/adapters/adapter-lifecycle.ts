import type { AdapterLifecycleStage } from "@/features/adapters/types";

/*
 * Adapter lifecycle — ordered stages + deterministic transition rules.
 * The Execution Engine drives an adapter through these; the SDK enforces
 * legal transitions so behavior is predictable and auditable.
 */
export const lifecycleStages: AdapterLifecycleStage[] = [
  "Registered",
  "Loaded",
  "Initialized",
  "Ready",
  "Executing",
  "Paused",
  "Cancelled",
  "Completed",
  "Failed",
  "Unloaded",
];

const transitions: Record<AdapterLifecycleStage, AdapterLifecycleStage[]> = {
  Registered: ["Loaded", "Unloaded"],
  Loaded: ["Initialized", "Unloaded", "Failed"],
  Initialized: ["Ready", "Failed", "Unloaded"],
  Ready: ["Executing", "Unloaded"],
  Executing: ["Paused", "Completed", "Cancelled", "Failed"],
  Paused: ["Executing", "Cancelled"],
  Cancelled: ["Ready", "Unloaded"],
  Completed: ["Ready", "Unloaded"],
  Failed: ["Ready", "Unloaded"],
  Unloaded: ["Registered"],
};

export function canTransition(from: AdapterLifecycleStage, to: AdapterLifecycleStage): boolean {
  return transitions[from].includes(to);
}

export function nextStages(from: AdapterLifecycleStage): AdapterLifecycleStage[] {
  return transitions[from];
}

export function isTerminal(stage: AdapterLifecycleStage): boolean {
  return stage === "Unloaded";
}

/* ── Lifecycle diagnostics (Phase 32) ──────────────────── */

export interface TransitionCheck {
  from: AdapterLifecycleStage;
  to: AdapterLifecycleStage;
  legal: boolean;
}

export interface LifecycleDiagnostics {
  stage: AdapterLifecycleStage;
  legalNext: AdapterLifecycleStage[];
  illegalNext: AdapterLifecycleStage[];
  reachableCount: number;
}

/** every illegal transition from a stage — powers lifecycle validation UI */
export function illegalTransitions(from: AdapterLifecycleStage): AdapterLifecycleStage[] {
  return lifecycleStages.filter((s) => s !== from && !canTransition(from, s));
}

export function lifecycleDiagnostics(stage: AdapterLifecycleStage): LifecycleDiagnostics {
  const legalNext = nextStages(stage);
  return {
    stage,
    legalNext,
    illegalNext: illegalTransitions(stage),
    reachableCount: legalNext.length,
  };
}

/** validate a proposed transition path; returns each hop's legality */
export function validateTransitionPath(path: AdapterLifecycleStage[]): TransitionCheck[] {
  const checks: TransitionCheck[] = [];
  for (let i = 1; i < path.length; i += 1) {
    checks.push({ from: path[i - 1], to: path[i], legal: canTransition(path[i - 1], path[i]) });
  }
  return checks;
}
