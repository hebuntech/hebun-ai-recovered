/*
 * Workflow CRUD — telemetry.
 */

import type { WorkflowAction, WorkflowTelemetryState } from "./types";

const state: WorkflowTelemetryState = {
  creates: 0,
  updates: 0,
  archives: 0,
  restores: 0,
  softDeletes: 0,
  validationFailures: 0,
  totalLatencyMs: 0,
  historyCount: 0,
};

const actionKey: Record<WorkflowAction, keyof WorkflowTelemetryState> = {
  create: "creates",
  update: "updates",
  archive: "archives",
  restore: "restores",
  delete: "softDeletes",
};

export function trackMutation(action: WorkflowAction, latencyMs: number): void {
  state[actionKey[action]] += 1;
  state.totalLatencyMs += latencyMs;
  state.historyCount += 1;
}

export function trackValidationFailure(): void {
  state.validationFailures += 1;
}

export function getTelemetry(): WorkflowTelemetryState {
  return { ...state };
}
