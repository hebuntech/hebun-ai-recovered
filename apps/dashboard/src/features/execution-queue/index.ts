/*
 * Execution Queue — stateful in-memory execution queue.
 *
 * Final layer of the deterministic chain: Readiness → Live Dispatch →
 * Execution Queue → Queue Lifecycle → Execution Monitor. Turns the recomputed
 * dispatch projection into a session-lived queue that survives re-renders and
 * advances only through validated, synchronous operations. Fully offline: no
 * providers, no APIs, no LLM, no database, no timers, no wall clock, no async.
 */

export * from "./types";
export {
  canTransition,
  operationTarget,
  isTerminal,
  defaultReason,
} from "./queue-transitions";
export {
  subscribe,
  getSnapshot,
  getEntries,
  getEntriesByAgent,
  getEntry,
  getTransitions,
  resetStore,
} from "./queue-store";
export { seedAgentQueue, applyOperation } from "./queue-engine";
export { advanceAgentQueue, runEntry } from "./queue-runner";
export { buildHistory, getGlobalHistory } from "./queue-history";
export { buildEvents } from "./queue-events";
export { buildTelemetry } from "./queue-telemetry";
export { buildProgress, buildReport, deriveHealth } from "./queue-report";
export {
  ensureAgentQueue,
  getAgentQueue,
  getExecutiveQueueMonitor,
  runQueueOperation,
  executionHealthBadge,
  startEntry,
  dequeueEntry,
  pauseEntry,
  resumeEntry,
  retryEntry,
  cancelEntry,
  completeEntry,
  failEntry,
  resetEntry,
} from "./queue-service";
