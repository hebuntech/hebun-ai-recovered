import { executionSessions } from "@/features/execution/execution-pipeline";
import type { ExecutionState } from "@/features/execution/types";

export function latestExecutionSession() {
  return executionSessions[0];
}

export function executionSessionById(id: string) {
  return executionSessions.find((session) => session.id === id);
}

export function executionSessionsByState(state: ExecutionState) {
  return executionSessions.filter((session) => session.executionState === state);
}
