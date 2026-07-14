/*
 * offline-execution-engine.ts — the deterministic End-to-End Offline Execution
 * Engine. Builds the offline execution session that proves the whole chain works
 * from plan to simulated provider result. No live execution, no provider APIs,
 * no network, no LLM. Future Live stays blocked.
 */

import { buildOfflineContext } from "@/features/offline-execution/offline-execution-context";
import { buildSession } from "@/features/offline-execution/offline-execution-session";
import type { OfflineExecutionSession } from "@/features/offline-execution/types";

export const offlineExecutionContext = buildOfflineContext();

/** deterministic offline execution session (one per orchestration blueprint). */
export const offlineSession: OfflineExecutionSession = buildSession(offlineExecutionContext);

export const offlineSessions: OfflineExecutionSession[] = [offlineSession];

export function sessionById(id: string): OfflineExecutionSession | undefined {
  return offlineSessions.find((s) => s.id === id);
}
