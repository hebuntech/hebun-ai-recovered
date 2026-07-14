/*
 * platform-core / events — barrel.
 * Canonical event envelope contract (Spec 48 §10.1). Contract only — no bus,
 * no publishing, no subscriptions, no event sourcing. Mock events untouched.
 * State-with-events vs event-sourcing is intentionally unresolved at this phase.
 */
export type { EventEnvelope } from "./types";
export { makeEventEnvelope } from "./event-envelope";
export { toEventLogInsert } from "./event-mapping";
export type { EventLogInsert } from "./event-mapping";
