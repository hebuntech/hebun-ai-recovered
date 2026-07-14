/*
 * Live Dispatch — the real internal execution backbone.
 *
 * Final layer of the deterministic chain. Turns READY commands into real
 * internally-queued commands and advances them through a deterministic queue
 * lifecycle. Fully offline: no providers, no APIs, no LLM, no timers, no async,
 * no wall clock. Same Execution Plan → identical dispatch order and states.
 */

export * from "./types";
export { buildAgentDispatch, classifyCommand } from "./dispatch-engine";
export { buildDispatchQueue } from "./dispatch-queue";
export { runDispatch } from "./dispatch-runner";
export { buildDispatchHistory } from "./dispatch-history";
export { buildDispatchEvents } from "./dispatch-events";
export { buildDispatchTelemetry } from "./dispatch-telemetry";
export {
  buildDispatchReport,
  buildDispatchProgress,
  deriveHealth,
} from "./dispatch-report";
export {
  getAgentLiveDispatch,
  getExecutiveLiveDispatch,
  getExecutiveDispatchMonitor,
  dispatchHealthBadge,
} from "./dispatch-service";
