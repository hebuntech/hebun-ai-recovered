/*
 * runtime-validator.ts — deterministic invariants over runtime decisions.
 * Confirms the boundary stays safe and explainable.
 */

import { runtimeStates } from "@/features/runtime-boundary/runtime-state";
import type { RuntimeDecision, RuntimeMode, RuntimeValidation } from "@/features/runtime-boundary/types";

const validModes: RuntimeMode[] = [
  "Simulation",
  "Dry Run",
  "Read Only",
  "Approval Required",
  "Future Live",
  "Blocked",
  "Emergency Stop",
];

const credentialStates = ["Not Required", "Missing", "Placeholder", "Injected", "Invalid", "Expired"];

export function validateRuntimeDecision(d: RuntimeDecision): RuntimeValidation {
  const issues: string[] = [];

  if (!d.invocationId) issues.push("Missing invocation reference.");
  if (d.allowed && !d.providerId) issues.push("An allowed decision must reference a provider.");
  if (!validModes.includes(d.runtimeMode)) issues.push("Invalid runtime mode.");
  if (!runtimeStates.includes(d.runtimeState)) issues.push("Invalid runtime state.");
  if (!credentialStates.includes(d.credential.state)) issues.push("Invalid credential state.");
  if (d.runtimeMode === "Future Live" && d.allowed) issues.push("Future Live must never be allowed in this phase.");
  if (d.allowed && d.blockReasons.length > 0) issues.push("Allowed decision must have no block reasons.");
  if (d.blocked && d.blockReasons.length === 0 && d.runtimeMode !== "Future Live" && d.runtimeMode !== "Blocked") {
    issues.push("Blocked decision must record a reason.");
  }
  if (d.gates.length !== 9) issues.push("All nine runtime gates must be evaluated.");
  if (!d.simulationFallback) issues.push("Simulation fallback must always be available.");

  return { decisionId: d.id, valid: issues.length === 0, issues };
}
