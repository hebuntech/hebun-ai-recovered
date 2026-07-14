/* Knowledge CRUD — telemetry (node CRUD + relationship operations). */
import type { KnowledgeAction, KnowledgeTelemetryState, RelationshipAction } from "./types";

const state: KnowledgeTelemetryState = {
  creates: 0,
  updates: 0,
  archives: 0,
  restores: 0,
  softDeletes: 0,
  relationshipOps: 0,
  validationFailures: 0,
  totalLatencyMs: 0,
  historyCount: 0,
};

const actionKey: Record<KnowledgeAction, keyof KnowledgeTelemetryState> = {
  create: "creates",
  update: "updates",
  archive: "archives",
  restore: "restores",
  delete: "softDeletes",
};

export function trackMutation(action: KnowledgeAction, latencyMs: number): void {
  state[actionKey[action]] += 1;
  state.totalLatencyMs += latencyMs;
  state.historyCount += 1;
}

export function trackRelationship(_action: RelationshipAction, latencyMs: number): void {
  state.relationshipOps += 1;
  state.totalLatencyMs += latencyMs;
  state.historyCount += 1;
}

export function trackValidationFailure(): void {
  state.validationFailures += 1;
}

export function getTelemetry(): KnowledgeTelemetryState {
  return { ...state };
}
