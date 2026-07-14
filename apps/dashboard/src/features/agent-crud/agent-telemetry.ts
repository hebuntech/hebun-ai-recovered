/*
 * Agent CRUD — telemetry.
 */

import type { AgentAction, AgentTelemetryState } from "./types";

const state: AgentTelemetryState = {
  creates: 0,
  updates: 0,
  archives: 0,
  restores: 0,
  softDeletes: 0,
  validationFailures: 0,
  totalLatencyMs: 0,
  historyCount: 0,
};

const actionKey: Record<AgentAction, keyof AgentTelemetryState> = {
  create: "creates",
  update: "updates",
  archive: "archives",
  restore: "restores",
  delete: "softDeletes",
};

export function trackMutation(action: AgentAction, latencyMs: number): void {
  state[actionKey[action]] += 1;
  state.totalLatencyMs += latencyMs;
  state.historyCount += 1;
}

export function trackValidationFailure(): void {
  state.validationFailures += 1;
}

export function getTelemetry(): AgentTelemetryState {
  return { ...state };
}
