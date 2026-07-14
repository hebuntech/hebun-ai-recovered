/*
 * Registry CRUD — telemetry.
 *
 * Deterministic in-memory counters for CRUD activity and command latency.
 */

import type { RegistryAction, RegistryTelemetryState } from "./types";

const state: RegistryTelemetryState = {
  creates: 0,
  updates: 0,
  archives: 0,
  restores: 0,
  softDeletes: 0,
  validationFailures: 0,
  totalLatencyMs: 0,
  historyCount: 0,
};

const actionKey: Record<RegistryAction, keyof RegistryTelemetryState> = {
  create: "creates",
  update: "updates",
  archive: "archives",
  restore: "restores",
  delete: "softDeletes",
};

export function trackMutation(action: RegistryAction, latencyMs: number): void {
  state[actionKey[action]] += 1;
  state.totalLatencyMs += latencyMs;
  state.historyCount += 1;
}

export function trackValidationFailure(): void {
  state.validationFailures += 1;
}

export function getTelemetry(): RegistryTelemetryState {
  return { ...state };
}
